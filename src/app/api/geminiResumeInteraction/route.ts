'use server';

import { createClient } from '@/utils/supabase/server';
import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
    SchemaType,
} from '@google/generative-ai';

export async function POST(req: Request, res: Response) {
    const supabase = await createClient();
    const requestBody = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    // validate the API
    if (!apiKey) {
        return new Response(
            JSON.stringify({
                message:
                    'Error accessing the API. Please contact the administrator',
            }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    // Get ALL the user data
    const { data, error } = await supabase.rpc('get_user_data');

    // If we cannot access the data or there is an error that means that the user is not authenticated, return an error response:
    if (error || !data) {
        return new Response(
            JSON.stringify({
                message:
                    'Error accessing your account. Please close your session and login again ' +
                    error?.message,
            }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    // prepare the gemini tool
    const genAI = new GoogleGenerativeAI(apiKey);
    //const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const model = genAI.getGenerativeModel({
        //model: "gemini-2.0-flash-exp",
        //model: "gemini-1.5-pro", // NOTE verify this is the correct model name, I am just guessing
        model: 'gemini-1.5-flash',
        // NOTE I checked on the gemini studio the number of tokens used on this set of instruction, it was around 450 tokens
        systemInstruction: `
            You are a highly skilled career counselor and resume writer. You excel at crafting compelling and 
            tailored resumes that highlight a candidate's most relevant skills and experiences for specific job opportunities.
            Given a user's complete professional profile and details about a target job, your task is to:
            Analyze the job description: 
             Identify keywords, required skills, and desired qualifications. 
            Select the most relevant information: 
             From the user's profile, choose the most impactful experiences (at least 4 if available), education (at least 4 if available), 
            and projects that align with the job description (at least 4 if available), ranking from the most relevant to the lesser relevant.
            Structure the resume content: 
             Generate the response with clear summary/objective, experience, education, skills, and projects.
            Tailor the content: 
             Craft concise and impactful bullet points for each experience and project, emphasizing 
            accomplishments and quantifiable results. Use keywords strategically throughout the resume.
            Provide explanations: 
             For each selected project and experience, generate a brief description explaining why it is 
            relevant to the target job, this data will be used to provide feedback to the user, not for the resume itself.
            Offer recommendations: 
             Suggest additional information the user could add or modify to further strengthen their resume, this data will be used 
             to provide feedback to the user, not for the resume itself.
            List keywords: 
             Include a separate section listing the keywords used in the resume to improve Applicant Tracking System 
            (ATS) compatibility.
                    `,
    });

    // with this configuration you can configure the responses of gemini
    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        // NOTE I checked on the gemini studio the number of tokens for a resume that I found on the
        // internet and it was around 500 tokens. I am going to use 2000 tokens to be safe
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
        responseSchema: {
            type: 'object' as SchemaType,
            properties: {
                summary: {
                    type: SchemaType.STRING,
                },
                experience: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: {
                                type: SchemaType.STRING,
                            },
                            company: {
                                type: SchemaType.STRING,
                            },
                            start_end_dates: {
                                type: SchemaType.STRING,
                            },
                            description: {
                                type: SchemaType.STRING,
                            },
                            relevance: {
                                type: SchemaType.STRING,
                            },
                        },
                        required: [
                            'title',
                            'company',
                            'start_end_dates',
                            'description',
                        ],
                    },
                },
                education: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            degree: {
                                type: SchemaType.STRING,
                            },
                            school: {
                                type: SchemaType.STRING,
                            },
                            start_end_dates: {
                                type: SchemaType.STRING,
                            },
                        },
                        required: ['degree', 'school', 'start_end_dates'],
                    },
                },
                skills: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                },
                projects: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            name: {
                                type: SchemaType.STRING,
                            },
                            description: {
                                type: SchemaType.STRING,
                            },
                            relevance: {
                                type: SchemaType.STRING,
                            },
                            start_end_dates: {
                                type: SchemaType.STRING,
                            },
                        },
                        required: [
                            'name',
                            'description',
                            'relevance',
                            'start_end_dates',
                        ],
                    },
                },
                keywords: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                },
                recommendations: {
                    type: SchemaType.STRING,
                },
                explanation: {
                    type: SchemaType.STRING,
                },
            },
            required: [
                'summary',
                'experience',
                'education',
                'skills',
                'projects',
                'keywords',
                'recommendations',
                'explanation',
            ],
        },
    };

    //console.log(data);

    const userInfo = userDummyData();
    const jobOffer = jobOfferDummyData()[2];

    const prompt = `User Information: 
    ${JSON.stringify(userInfo)}
    Job Offer: 
    ${JSON.stringify(jobOffer)}`;

    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [], // TODO I am not sure what is this but I feel we are going to need it
        });

        // We send the user entry
        const result = await chatSession.sendMessage(prompt);

        return new Response(
            JSON.stringify({
                message: result.response.text(),
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: `Critical Error during resume generation`,
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}

function jobOfferDummyData() {
    return [
        {
            company_name: 'Google',
            job_position: 'Software Engineer',
            job_description:
                'We are looking for a talented software engineer to join our team and help us build innovative products. The ideal candidate should have experience in web development, strong problem-solving skills, and a passion for technology.',
        },
        {
            job_position: 'Software Developer',
            company_name: 'Google',
            job_description:
                "Join our dynamic team to develop innovative solutions for Google's core products. You will be working on challenging projects involving large-scale distributed systems, machine learning, and artificial intelligence.  Requires strong experience with Java or C++ and a passion for problem-solving.",
        },
        {
            job_position: 'Frontend Engineer',
            company_name: 'Meta',
            job_description:
                "Meta is seeking a talented Frontend Engineer to help build the next generation of social networking platforms. You'll be working with React, Redux, and GraphQL to create engaging and performant user interfaces. Experience with responsive design and accessibility best practices is a must.",
        },
        {
            job_position: 'Data Scientist',
            company_name: 'Amazon',
            job_description:
                "Amazon's Data Science team is looking for a skilled Data Scientist to develop and implement machine learning models that drive business decisions. You will be working with massive datasets, utilizing statistical analysis and predictive modeling techniques. Proficiency in Python or R is required.",
        },
        {
            job_position: 'Full Stack Engineer',
            company_name: 'Microsoft',
            job_description:
                'We are looking for a versatile Full Stack Engineer to join our team at Microsoft. You will be working on a variety of projects using technologies like .NET, Azure, and React.  Strong problem-solving skills and experience with both frontend and backend development are essential.',
        },
        {
            job_position: 'Machine Learning Engineer',
            company_name: 'Tesla',
            job_description:
                "Tesla's Autopilot team seeks a Machine Learning Engineer to enhance our self-driving technology. Responsibilities include developing and deploying machine learning models, working with large datasets, and collaborating with other engineers to improve vehicle performance and safety. Experience with deep learning frameworks like TensorFlow or PyTorch is required.",
        },
        {
            job_position: 'DevOps Engineer',
            company_name: 'Netflix',
            job_description:
                'Netflix is hiring a DevOps Engineer to help maintain and scale our global streaming infrastructure. You will be responsible for automating deployments, monitoring system health, and improving the reliability of our services. Experience with cloud platforms like AWS and containerization technologies like Docker and Kubernetes is highly desirable.',
        },
        {
            job_position: 'Cybersecurity Analyst',
            company_name: 'IBM',
            job_description:
                "Join IBM's Security team as a Cybersecurity Analyst to protect our systems and data from cyber threats.  Responsibilities include monitoring security alerts, conducting vulnerability assessments, and developing security protocols. Experience with intrusion detection systems and security information and event management (SIEM) tools is required.",
        },
        {
            job_position: 'Mobile App Developer',
            company_name: 'Apple',
            job_description:
                'Apple is looking for an experienced Mobile App Developer to join our iOS team. You will be responsible for designing, developing, and maintaining high-quality mobile applications using Swift and Xcode.  A strong understanding of iOS frameworks and a passion for creating exceptional user experiences are essential.',
        },
        {
            job_position: 'Cloud Architect',
            company_name: 'Amazon Web Services (AWS)',
            job_description:
                'AWS is seeking a skilled Cloud Architect to design and implement scalable and reliable cloud solutions for our customers. You will work with clients to understand their business needs and develop cloud architectures that meet their requirements.  Deep knowledge of AWS services and experience with infrastructure as code are highly desirable.',
        },
        {
            job_position: 'Game Developer',
            company_name: 'Electronic Arts (EA)',
            job_description:
                'EA is hiring a Game Developer to work on our next generation of video games. You will be involved in all stages of game development, from concept to release. Experience with game engines like Unity or Unreal Engine, as well as strong programming skills in C++ or C#, are required.',
        },
    ];
}
function userDummyData() {
    return {
        contact_info: {
            name: 'Arturo',
            email: 'arturo@linuxmagic.com',
            phone: '1234567890',
            linkedin: 'https://www.linkedin.com/in/arturo/',
        },

        projects: [
            {
                project_name: 'A* pathfinding algorithm',
                project_type: 'personal',
                project_description:
                    'I have created an algorithm to find the shortest path from point a to point b avoiding obstacles in a 2d grid system',
            },
            {
                project_name: 'E-commerce Website',
                project_type: 'professional',
                project_description:
                    'Developed a full-stack e-commerce website using React, Node.js, and MongoDB, including user authentication, product browsing, shopping cart, and payment integration.',
            },
            {
                project_name: 'Machine Learning Model for Image Recognition',
                project_type: 'personal',
                project_description:
                    'Built a machine learning model using TensorFlow and Keras to classify images into different categories with high accuracy.',
            },
            {
                project_name: 'Mobile App for Task Management',
                project_type: 'freelance',
                project_description:
                    'Designed and developed a cross-platform mobile app using Flutter for managing tasks, setting reminders, and tracking progress.',
            },
            {
                project_name: 'Data Analysis of Social Media Trends',
                project_type: 'academic',
                project_description:
                    'Conducted a data analysis project using Python and Pandas to identify and visualize trends in social media data collected from Twitter API.',
            },
            {
                project_name: 'Portfolio Website',
                project_type: 'personal',
                project_description:
                    'Created a responsive personal portfolio website using HTML, CSS, and JavaScript to showcase my projects and skills.',
            },
            {
                project_name: 'Real-time Chat Application',
                project_type: 'personal',
                project_description:
                    'Developed a real-time chat application using Socket.IO, Node.js, and React, allowing users to communicate instantly in different chat rooms.',
            },
            {
                project_name: 'Inventory Management System',
                project_type: 'professional',
                project_description:
                    'Built a web-based inventory management system using Django and PostgreSQL to track stock levels, manage orders, and generate reports.',
            },
            {
                project_name: 'Weather App',
                project_type: 'personal',
                project_description:
                    'Developed a weather application that fetches data from a weather API and displays current weather conditions and forecasts for a given location using JavaScript.',
            },
            {
                project_name: 'Blog Platform',
                project_type: 'personal',
                project_description:
                    'Created a simple blog platform using Ruby on Rails where users can create accounts, write posts, and comment on other posts.',
            },
        ],
        education: [
            {
                school_name: 'BCIT',
                field_of_study: 'Computer Information Systems',
            },
            {
                school_name: 'University of California, Berkeley',
                field_of_study: 'Computer Science',
            },
            {
                school_name: 'Massachusetts Institute of Technology (MIT)',
                field_of_study: 'Electrical Engineering and Computer Science',
            },
            {
                school_name: 'Stanford University',
                field_of_study: 'Data Science',
            },
            {
                school_name: 'University of Waterloo',
                field_of_study: 'Software Engineering',
            },
            {
                school_name: 'Harvard University',
                field_of_study: 'Applied Mathematics',
            },
            {
                school_name: 'California Institute of Technology (Caltech)',
                field_of_study: 'Mechanical Engineering',
            },
            {
                school_name: 'University of Toronto',
                field_of_study: 'Computer Engineering',
            },
            {
                school_name: 'Oxford University',
                field_of_study: 'Mathematics and Computer Science',
            },
            {
                school_name: 'Carnegie Mellon University',
                field_of_study: 'Information Systems Management',
            },
        ],
        experience: [
            {
                job_title: 'Software Developer',
                company_name: 'Amazon',
                description:
                    "Developed and maintained features for Amazon's retail website. Worked on improving the performance of the product recommendation engine and implemented A/B testing frameworks.",
            },
            {
                job_title: 'Frontend Engineer',
                company_name: 'Google',
                description:
                    "Built and optimized user interfaces for Google's search engine results page. Implemented responsive design and improved page load times by 20%.",
            },
            {
                job_title: 'Data Scientist',
                company_name: 'Facebook',
                description:
                    'Developed machine learning models to improve ad targeting and content recommendation algorithms. Conducted data analysis to identify key user engagement metrics.',
            },
            {
                job_title: 'Full Stack Developer',
                company_name: 'Netflix',
                description:
                    "Worked on the development of Netflix's streaming platform. Built RESTful APIs using Node.js and developed user interfaces using React.",
            },
            {
                job_title: 'Backend Engineer',
                company_name: 'Microsoft',
                description:
                    'Developed and maintained backend services for Microsoft Azure. Implemented scalable and reliable cloud solutions using microservices architecture.',
            },
            {
                job_title: 'Mobile App Developer',
                company_name: 'Uber',
                description:
                    "Developed and maintained features for Uber's iOS and Android applications. Implemented location-based services and improved app performance.",
            },
            {
                job_title: 'DevOps Engineer',
                company_name: 'Airbnb',
                description:
                    "Managed and optimized Airbnb's cloud infrastructure. Implemented CI/CD pipelines and automated deployment processes.",
            },
            {
                job_title: 'Machine Learning Engineer',
                company_name: 'Tesla',
                description:
                    "Developed and deployed machine learning models for Tesla's Autopilot system. Worked on object detection and path planning algorithms.",
            },
            {
                job_title: 'UI/UX Designer',
                company_name: 'Spotify',
                description:
                    "Designed user interfaces and experiences for Spotify's web and mobile applications. Conducted user research and created wireframes and prototypes.",
            },
            {
                job_title: 'Database Administrator',
                company_name: 'Oracle',
                description:
                    "Managed and maintained Oracle's database systems. Optimized database performance and ensured data integrity and security.",
            },
        ],
    };
}
