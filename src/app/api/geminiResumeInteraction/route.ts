'use server';

import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { TOKEN_COSTS } from '@/app/config/costs.config';

export async function POST(req: Request) {
    const supabase = await createClient();

    // Get the user from the request
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Check if the user is authenticated
    if (!user) {
        return new Response(JSON.stringify({ message: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const requestJobDescBody = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set.');
        return new Response(
            JSON.stringify({
                message:
                    'API configuration error. Please contact the administrator.',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    const { data: userData, error: userError } = await supabase.rpc(
        'get_user_data',
    );

    // Check if userData is null or undefined or if there is an error
    if (userError || !userData) {
        return new Response(
            JSON.stringify({
                message:
                    'Error accessing your account. Please close your session and login again ' +
                    userError?.message,
            }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    const resumeCost = TOKEN_COSTS.AI_RESUME_GENERATION;

    console.log(resumeCost);
    // Check if the user has enough tokens to generate a resume
    if (!userData.token_balance || userData.token_balance < resumeCost) {
        // TODO maybe we need to show the user a modal to buy more tokens
        return new Response(
            JSON.stringify({
                message: 'Not enough tokens to generate a resume.',
            }),
            { status: 402 },
        ); // 402 Payment Required
    }

    // Deduct tokens if the user has enough
    const { error: rpcError } = await supabase.rpc('deduct_tokens', {
        user_id_param: user.id,
        amount: resumeCost,
    });

    // If there was an error deducting tokens, return an error response
    if (rpcError) {
        return new Response(
            JSON.stringify({
                message: 'An error occurred with your account transaction.',
            }),
            { status: 500 },
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
        You are a world-class AI-powered career counselor and a master resume writer, specializing in creating highly specific and ATS-optimized resumes that secure interviews. Your expertise lies in meticulously analyzing a candidate's professional history and a target job description to forge a compelling narrative that perfectly aligns the candidate with the opportunity.

        Remember to find a good balance between lean and high quality content, avoiding unnecessary verbosity while ensuring the resume is rich in relevant details.

Given a user's comprehensive professional profile from our database and the details of a target job opportunity, your task is to generate a JSON object that will be used to construct a tailored resume. You must populate all fields of the provided JSON structure.
Primary Directives:

    Analyze and Extract:
        Thoroughly dissect the provided job description to identify all critical keywords, core competencies, required skills, and essential qualifications.
        From the user's complete profile, strategically select the most relevant and impactful information that directly addresses the job requirements.

    Content Generation and Tailoring:
        Rewrite and refine the user's information to be concise, powerful, and rich with the identified keywords.
        Focus on accomplishments and quantifiable results. For every responsibility and project description, use action verbs and include metrics where possible (e.g., "Increased revenue by 15%," "Reduced processing time by 25%").

JSON Field-by-Field Instructions:

    keywords (Array of Strings):
        Compile a comprehensive list of the most critical keywords and phrases extracted from the job description. This list should be used to tailor the rest of the resume content for ATS optimization.

    recommendations (String):
        Provide actionable and constructive recommendations for the user. This should not be part of the resume itself but rather feedback for the user.
        Suggest specific ways they could further enhance their profile or resume, such as additional skills to acquire, certifications to pursue, or experiences to highlight in an interview.

    explanation (String):
        Generate a concise, well-reasoned explanation for your content choices. This is for user feedback, not for the resume.
        Justify why the selected experiences and projects are the most relevant to the target job, referencing the job description's requirements.

    layout (Object):

        This object will contain the visual and textual content of the resume itself.

        narrative (Object):
            title: Use a professional title like "Professional Summary" or "Objective."
            display: Set to true.
            items: Craft a compelling 2-4 sentence summary. Crucially, this summary must be tailored to the specific role and company, mentioning either the job title or the company name to immediately capture the recruiter's attention.

        experience (Object):
            title: Use a standard title like "Work Experience" or "Professional Experience."
            display: Set to true.
            items (Array of Objects):
                Select up to four of the most relevant job experiences from the user's profile, ordered from most to least relevant to the target job.
                For each item, set display to true. You must ensure at least three experiences are set to true if available and if available up to 3 more with display false.
                responsabilities: This is the most critical part. Re-write the responsibilities as a series of impactful, bulleted accomplishments. Each bullet point should start with a strong action verb and, where possible, include quantifiable achievements. Format this as a single string with newline characters (\n-) separating the bullet points.

        education (Object):
            title: Use the title "Education."
            display: Set to true.
            items (Array of Objects):
                List the user's relevant educational background.
                show if available 3 with display true and up to 5 with display false
                For each item, set display to true.

        skills (Object):
            title: Use the title "Skills."
            display: Set to true.
            items (Array of Strings):
                Compile a list of skills from the user's profile that are most relevant to the job description. Include a mix of hard and soft skills identified as important for the role.

        projects (Object):
            title: Use a title like "Projects" or "Key Projects."
            display: Set to true.
            items (Array of Objects):
                Select up to four of the most relevant projects, ordered from most to least relevant.
                For each item, set display to true. You must ensure at least TWO projects are set to true if available and if possible 3 with display false.
                description: Rewrite the project description to highlight the skills and technologies used, and the outcomes or results of the project, ensuring it aligns with the target job's requirements.
        `,
        /* `
            You are a highly skilled career counselor and resume writer. You excel at crafting compelling and 
            tailored resumes that highlight a candidate's most relevant skills and experiences for specific job opportunities with very specific resumes for each job offer.
            Given a user's complete professional profile and details about a target job, your task is to:
            Analyze the job description: 
             Identify keywords, required skills, and desired qualifications. 
            Select the most relevant information: 
             From the user's profile, choose the most impactful experiences (at least 4 if available), education (at least 4 if available), 
            and projects that align with the job description (at least 4 if available), ranking from the most relevant to the lesser relevant.
            For the experience section, prioritize recent roles and those that match the job requirements and generate a list of responsabilities in a list format
            i.e. (Conducted financial analysis using X, increasing revenue for a commercial real estate portfolio by 21%)
            - responsability
            - responsability
            - responsability
            Structure the resume content: 
             Generate the response with clear summary/objective, experience, education, skills, and projects. The experience should be detailed.
             summary always must include the name of the company or the position so that this resume will be tailored specifically for this company
            Display property:
             there is a display property for each experience and project, if it is false, it should not be displayed in the resume, by default
             you need to display at least 3 items on projects and 3 items on experience
            Tailor the content: 
             Craft concise and impactful bullet points for each experience and project, emphasizing 
            accomplishments and quantifiable results, generate an impactful and descriptive description of the role and relevance of the activities performed. 
            Use keywords strategically throughout the resume.
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
                    */
    });

    // with this configuration you can configure the responses of gemini
    const generationConfig = {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        // NOTE I checked on the gemini studio the number of tokens for a resume that I found on the
        // internet and it was around 500 tokens. I am going to use 2000 tokens to be safe
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
        responseSchema: {
            type: 'object' as SchemaType,
            properties: {
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
                layout: {
                    type: SchemaType.OBJECT,
                    properties: {
                        narrative: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: {
                                    type: SchemaType.STRING,
                                },
                                display: {
                                    type: SchemaType.BOOLEAN,
                                },
                                items: {
                                    type: SchemaType.STRING,
                                },
                            },
                            required: ['display', 'items'],
                        },
                        experience: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: {
                                    type: SchemaType.STRING,
                                },
                                display: {
                                    type: SchemaType.BOOLEAN,
                                },
                                items: {
                                    type: SchemaType.ARRAY,
                                    items: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            company: {
                                                type: SchemaType.STRING,
                                            },
                                            display: {
                                                type: SchemaType.BOOLEAN,
                                            },
                                            start_end_dates: {
                                                type: SchemaType.STRING,
                                            },
                                            title: {
                                                type: SchemaType.STRING,
                                            },
                                            responsabilities: {
                                                type: SchemaType.STRING,
                                            },
                                        },
                                        required: [
                                            'company',
                                            'display',
                                            'start_end_dates',
                                            'title',
                                            'responsabilities',
                                        ],
                                    },
                                },
                            },
                            required: ['display', 'items'],
                        },
                        education: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: {
                                    type: SchemaType.STRING,
                                },
                                display: {
                                    type: SchemaType.BOOLEAN,
                                },
                                items: {
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
                                            display: {
                                                type: SchemaType.BOOLEAN,
                                            },
                                        },
                                        required: [
                                            'degree',
                                            'school',
                                            'display',
                                        ],
                                    },
                                },
                            },
                            required: ['display', 'items'],
                        },
                        skills: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: {
                                    type: SchemaType.STRING,
                                },
                                display: {
                                    type: SchemaType.BOOLEAN,
                                },
                                items: {
                                    type: SchemaType.ARRAY,
                                    items: {
                                        type: SchemaType.STRING,
                                    },
                                },
                            },
                            required: ['display', 'items'],
                        },
                        projects: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: {
                                    type: SchemaType.STRING,
                                },
                                display: {
                                    type: SchemaType.BOOLEAN,
                                },
                                items: {
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
                                            display: {
                                                type: SchemaType.BOOLEAN,
                                            },
                                            start_end_dates: {
                                                type: SchemaType.STRING,
                                            },
                                        },
                                        required: [
                                            'name',
                                            'description',
                                            'display',
                                            'start_end_dates',
                                        ],
                                    },
                                },
                            },
                            required: ['display', 'items'],
                        },
                    },
                    required: [
                        'narrative',
                        'experience',
                        'education',
                        'skills',
                        'projects',
                    ],
                },
            },
            required: ['keywords', 'recommendations', 'explanation', 'layout'],
        },
    };

    /*
    // NOTE this debug will test the real data passed by the user
    console.log('USER DATA: ');
    console.log(userData);
    console.log('JOB OFFER: ');
    console.log(requestJobDescBody);
    */

    // NOTE: These functions will get dummy data
    //const userInfo = userDummyData();
    //const jobOffer = jobOfferDummyData()[Math.floor(Math.random() * 12)];

    // NOTE REAL DATA PASSED BY THE USER
    const prompt = `User Information: 
    ${JSON.stringify(userData)}
    Job Offer: 
    ${JSON.stringify(requestJobDescBody)}`;
    /* 
    NOTE: this is a prompt for dummy data
    const prompt = `User Information: 
    ${JSON.stringify(userInfo)}
    Job Offer: 
    ${JSON.stringify(jobOffer)}`;
    */

    try {
        const chatSession = model.startChat({
            generationConfig,
            // history is for multi-turn conversations. An empty array is correct for this single-shot generation.
            history: [],
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
        console.error('Critical Error during resume generation:', error);
        return new Response(
            JSON.stringify({
                message:
                    'An unexpected error occurred while generating the resume. Please try again later.',
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
        userId: 'user-123',
        profile_data: {
            personal_info: {
                full_name: 'Elena Petrova',
                email: 'elena.petrova.dev@email.com',
                phone: '778-555-0101',
                linkedin: 'linkedin.com/in/elenapetrovadev',
                github: 'github.com/elenapetrova',
                website: 'elenapetrova.dev',
            },
            professional_summary:
                'A highly motivated and experienced Senior Full-Stack Engineer with over 8 years of experience in designing, developing, and deploying scalable web applications. Proficient in JavaScript, Python, and various modern frameworks like React and Django. Passionate about creating clean, efficient code and leading development teams to success.',
            work_experience: [
                {
                    job_title: 'Senior Software Engineer',
                    company: 'Innovatech Solutions Inc.',
                    location: 'Vancouver, BC',
                    start_date: '2021-06-01',
                    end_date: 'Present',
                    responsibilities: [
                        'Led a team of 5 engineers in the development of a new SaaS platform for enterprise clients.',
                        'Architected and implemented a microservices-based backend using Python (Django) and Docker, improving system scalability.',
                        'Developed and maintained the front-end application using React, Redux, and TypeScript, resulting in a 30% improvement in load times.',
                        'Established CI/CD pipelines using Jenkins and AWS, automating the deployment process and reducing deployment failures by 40%.',
                        'Mentored junior developers, providing code reviews and guidance on best practices.',
                    ],
                },
                {
                    job_title: 'Full-Stack Developer',
                    company: 'DataWeaver Analytics',
                    location: 'Toronto, ON',
                    start_date: '2018-01-15',
                    end_date: '2021-05-28',
                    responsibilities: [
                        'Developed user-facing features for a data analytics dashboard using React and D3.js.',
                        'Built and maintained RESTful APIs with Node.js and Express to serve data to the front-end.',
                        'Managed a PostgreSQL database, including schema design and query optimization.',
                        'Collaborated with product managers and designers in an Agile environment to define feature requirements.',
                        'Wrote unit and integration tests using Jest and Cypress to ensure code quality.',
                    ],
                },
                {
                    job_title: 'Junior Web Developer',
                    company: 'Creative Web Agency',
                    location: 'Toronto, ON',
                    start_date: '2016-05-01',
                    end_date: '2017-12-30',
                    responsibilities: [
                        'Built and styled responsive websites for clients using HTML, CSS, and jQuery.',
                        'Assisted senior developers in building custom WordPress themes and plugins.',
                        'Helped with website maintenance and bug fixes.',
                    ],
                },
                {
                    job_title: 'Software Development Intern',
                    company: 'TechGenius Labs',
                    location: 'Toronto, ON',
                    start_date: '2015-05-01',
                    end_date: '2015-08-31',
                    responsibilities: [
                        'Assisted the mobile development team with developing a new feature for their Android application using Java.',
                        'Wrote and executed test cases to ensure software quality.',
                        'Participated in daily stand-ups and sprint planning meetings.',
                    ],
                },
            ],
            education: [
                {
                    school: 'University of British Columbia',
                    degree: 'Master of Science in Computer Science',
                    start_date: '2016-09-01',
                    end_date: '2018-05-30',
                    details: 'Specialization in Human-Computer Interaction.',
                },
                {
                    school: 'University of Toronto',
                    degree: 'Bachelor of Science in Computer Science',
                    start_date: '2012-09-01',
                    end_date: '2016-04-30',
                    details:
                        'Graduated with High Distinction, Minor in Mathematics.',
                },
            ],
            skills: {
                programming_languages: [
                    'JavaScript (ES6+)',
                    'Python',
                    'TypeScript',
                    'Java',
                    'HTML5',
                    'CSS3/SASS',
                ],
                frameworks_libraries: [
                    'React',
                    'Redux',
                    'Node.js',
                    'Express.js',
                    'Django',
                    'jQuery',
                    'D3.js',
                ],
                databases: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'],
                tools_platforms: [
                    'AWS (EC2, S3, RDS)',
                    'Docker',
                    'Kubernetes',
                    'Jenkins',
                    'Git',
                    'Webpack',
                    'Android Studio',
                ],
                methodologies: [
                    'Agile/Scrum',
                    'Microservices Architecture',
                    'Test-Driven Development (TDD)',
                ],
            },
            projects: [
                {
                    name: 'Real-Time Collaborative Code Editor',
                    description:
                        'A web-based application that allows multiple users to edit code in real-time. Built using WebSockets for live collaboration and a Monaco Editor instance for the text editing experience.',
                    technologies_used: [
                        'React',
                        'Node.js',
                        'WebSockets',
                        'Redis',
                        'Docker',
                    ],
                    start_end_dates: '2023-01-01 to 2023-04-01',
                },
                {
                    name: 'E-commerce Analytics Dashboard',
                    description:
                        'A personal project to analyze sales data from a mock e-commerce store. The dashboard features various charts and data visualizations to track sales trends, top products, and customer behavior.',
                    technologies_used: [
                        'Python (Flask)',
                        'Pandas',
                        'Chart.js',
                        'PostgreSQL',
                    ],
                    start_end_dates: '2022-05-01 to 2022-07-01',
                },
                {
                    name: 'Open Source Contribution - D3.js Library',
                    description:
                        'Contributed to the popular data visualization library D3.js. Fixed a bug related to axis label rendering on Safari and added a new feature for creating Sankey diagrams.',
                    technologies_used: ['JavaScript', 'D3.js', 'Git'],
                    start_end_dates: '2021-08-01 to 2021-10-31',
                },
            ],
        },
    };
}
