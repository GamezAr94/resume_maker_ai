import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
    const supabase = await createClient();

    // Get the user from the request
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({ message: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const requestJobDescBody = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set.");
        return new Response(
            JSON.stringify({
                message:
                    "API configuration error. Please set GEMINI_API_KEY.",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    const { data: userData, error: userError } =
        await supabase.rpc("get_user_data");

    if (userError || !userData) {
        return new Response(
            JSON.stringify({
                message:
                    "Error accessing your profile data: " +
                    userError?.message,
            }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    // prepare the gemini tool
    const genAI = new GoogleGenerativeAI(apiKey);
    //const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        // NOTE I checked on the gemini studio the number of tokens used on this set of instruction, it was around 450 tokens
        systemInstruction: `
You are a world-class AI-powered career counselor and a master resume writer, specializing in creating highly specific and ATS-optimized resumes that secure interviews. Your expertise lies in meticulously analyzing a candidate's professional history and a target job description to forge a compelling narrative that perfectly aligns the candidate with the opportunity.

⭐ GOLDEN RULES ⭐
1.  **NEVER INVENT DATA:** You are strictly prohibited from generating any information that is not present in the user's profile. This includes job experiences, projects, skills, or educational details. If the user's profile is sparse, you must work with the information provided and note the gaps in the recommendations.
2.  **BASE ALL FEEDBACK ON SOURCE DATA:** All feedback in the 'recommendations' section must be a direct analysis of the user's ORIGINAL provided information, not the enhanced resume you are creating.
3.  **DATES:** You must always show the format MMM YYYY for example 'Jul 2021' skip the day, ALWAYS for the experience or education skip the day just keep the month and year.
4.  **NEW DATA STRUCTURE:** The user's profile now contains a 'details' object.
    * **'details.summary':** Use this for context.
    * **'details.responsibilities':** These are routine tasks. Use them for "Scope".
    * **'details.achievements':** THESE ARE GOLD. Prioritize these for the "Hierarchy of Impact".
    * **'details.skills_used':** Use these to populate the skills section or tag specific technologies in bullet points.

Given a user's comprehensive professional profile from our database and the details of a target job opportunity, your task is to generate a JSON object that will be used to construct a tailored resume.

⭐ Core Directive: The "Core Narrative Angle" ⭐
Before any other step, you must first determine the central story or "Core Narrative Angle" for this specific resume. Analyze the job description and the user's profile to answer: "What is the single most compelling identity this candidate can present for this specific role?" Examples include: "A Platform-Focused Product Manager," "A Security-Minded Software Engineer," "A User-Centric Data Analyst." This angle will govern all content rewriting and tailoring decisions.

JSON Field-by-Field Instructions:

    keywords (Array of Strings):
        Compile a comprehensive list of the most critical keywords and phrases extracted from the job description. This list should be used to tailor the rest of the resume content for ATS optimization.

    feedback (Object): A structured object containing actionable advice.

        candidateFit (Object):
            score (Integer): Provide a numerical score from 0 to 100 representing the candidate's fit for the role based on their original master profile. A higher score means a better match.
            summary (String): A single, concise sentence justifying the score. Example: "Your background in building scalable APIs and prior experience as a SWE directly aligns with the core requirements for this role."

        masterProfileSuggestions (Array of Objects): Provide 1-2 specific, actionable suggestions for how the user can improve their MASTER PROFILE for future resumes.
            suggestion (String): The core advice. Example: "Quantify the impact of your work on developer productivity."
            example (String): (Optional) Provide a concrete example. Example: "For instance, instead of 'managed the API,' try 'reduced API response time by 40% by implementing a Redis caching layer.'"

        interviewPrep (Object): Provide targeted advice for the interview process.
            companyFocus (String): Give one piece of advice based on the company's culture or values mentioned in the job description. Example: "Finch emphasizes 'internal trust,' so prepare an example of how you've fostered trust in a team."
            technicalTopics (Array of Strings): List 2-3 specific technical topics or skills mentioned in the job description that the user should be prepared to discuss.


    layout (Object):
        {
        narrative: {
            title: "Professional Summary",
            display: true,
            items: [ (This summary must be a compelling, unique 2-4 sentence narrative. Follow these steps):
            1.  **Identify the Core Hook (in this order of priority):**
                * **a. A Specific Challenge or Goal for the Role:** (Highest Priority) "scaling our microservices," "owning our API strategy."
                * **b. A Key Skill or Technology:** "deep expertise in Python and AWS," "a passion for developer experience."
                * **c. The Company's Specific Mission:** (Lowest Priority) "to revolutionize people management."
            2.  **Select the Most Relevant Accomplishment:** From the user's master document, find the single best accomplishment or project that directly relates to the "hook."
            3.  **Construct the Narrative:** Weave these two elements together. Start with your accomplishment as proof, then connect it to the company's goal.
            ]
        },
        experience: {
            title: "Work Experience",
            display: true,
            items: [ (Select up to 4 relevant experiences. For each, generate 3-5 high-impact bullet points using these steps):
                ⭐ Step 0: Reframe for the Core Narrative Angle (Most Critical Step) ⭐
                Before selecting metrics or scope, you **must** first analyze the user's accomplishment and rewrite it to align with the **Core Narrative Angle** you defined in your strategic plan. The same achievement can be described in multiple ways. For EACH bullet point, you MUST re-read the Core Narrative Angle and ensure your reframed sentence directly supports it. **Do not use a generic or previously generated version of this accomplishment.**
                * **Example of Reframing:**
                    * **User's Accomplishment:** Launched a telehealth feature with SMS reminders that increased patient engagement.
                    * **Target Job #1 (User-Facing PM):** "Spearheaded a telehealth expansion that **increased patient engagement by 35%** by launching a user-friendly scheduling system with automated SMS reminders."
                    * **Target Job #2 (Platform/API PM):** "Owned the product strategy for a new scheduling service, **leading the technical integration of the Twilio API** and defining the API requirements to support multiple front-end applications."

                **Step 1: Hierarchy of Impact - Priority #1: Use Quantifiable Data (if available)**
                * **Formula:** [Action Verb] + [what you did] + [to achieve a Quantifiable Result].

                **Step 2: Hierarchy of Impact - Priority #2: Describe Scope and Scale (if no metrics)**
                * **Formula:** [Action Verb] + [what you did] + [in the context of a large or important system].

                **Step 3: Hierarchy of Impact - Priority #3: Highlight Technology and Complexity**
                * **Formula:** [Action Verb] + [a key feature] + [using Specific, Impressive Technology] + [to solve a Business Problem].

                **Final Rule:** Every bullet must be reframed and communicate value. After generating, reorder the bullets so the most impactful one for the target job appears FIRST.
            ]
        },
        education: { /* ... (your original, good instructions here) ... */ },
        skills: {
            title: "Skills",
            display: true,
            items: [ (Compile and order skills with a clear priority: 1. Skills explicitly mentioned in the job description. 2. Other relevant skills from the user's profile.) ]
        },
        projects: {
            title: "Key Projects",
            display: true,
            items: [ (Select up to 4 relevant projects. The description for each bullet point MUST follow the exact same logic as the 'experience' section: Step 0: Reframe, followed by the Hierarchy of Impact.) ]
        }
        }
        `,
    });

    // with this configuration you can configure the responses of gemini
    const generationConfig = {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        // NOTE I checked on the gemini studio the number of tokens for a resume that I found on the
        // internet and it was around 500 tokens. I am going to use 2000 tokens to be safe
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
        responseSchema: {
            type: "object" as SchemaType,
            properties: {
                keywords: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                },

                feedback: {
                    type: SchemaType.OBJECT,
                    properties: {
                        candidateFit: {
                            type: SchemaType.OBJECT,
                            properties: {
                                score: { type: SchemaType.INTEGER },
                                summary: { type: SchemaType.STRING },
                            },
                            required: ["score", "summary"],
                        },
                        masterProfileSuggestions: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    suggestion: { type: SchemaType.STRING },
                                    example: { type: SchemaType.STRING },
                                },
                                required: ["suggestion"],
                            },
                        },
                        interviewPrep: {
                            type: SchemaType.OBJECT,
                            properties: {
                                companyFocus: { type: SchemaType.STRING },
                                technicalTopics: {
                                    type: SchemaType.ARRAY,
                                    items: { type: SchemaType.STRING },
                                },
                            },
                            required: ["companyFocus", "technicalTopics"],
                        },
                    },
                    required: [
                        "candidateFit",
                        "masterProfileSuggestions",
                        "interviewPrep",
                    ],
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
                            required: ["display", "items"],
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
                                            "company",
                                            "display",
                                            "start_end_dates",
                                            "title",
                                            "responsabilities",
                                        ],
                                    },
                                },
                            },
                            required: ["display", "items"],
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
                                            "degree",
                                            "school",
                                            "display",
                                        ],
                                    },
                                },
                            },
                            required: ["display", "items"],
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
                            required: ["display", "items"],
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
                                            "name",
                                            "description",
                                            "display",
                                            "start_end_dates",
                                        ],
                                    },
                                },
                            },
                            required: ["display", "items"],
                        },
                    },
                    required: [
                        "narrative",
                        "experience",
                        "education",
                        "skills",
                        "projects",
                    ],
                },
            },
            required: ["keywords", "feedback", "layout"],
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

        // --- TOKEN COUNTING LOGIC ---
        // Access the usage metadata from the response
        const usageMetadata = result.response.usageMetadata;
        if (usageMetadata) {
            console.log("Token Usage:");
            console.log(`- Prompt Tokens: ${usageMetadata.promptTokenCount}`);
            console.log(
                `- Response Tokens: ${usageMetadata.candidatesTokenCount}`,
            );
            console.log(`- Total Tokens: ${usageMetadata.totalTokenCount}`);
        }
        // --- END TOKEN COUNTING ---

        return new Response(
            JSON.stringify({
                message: result.response.text(),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("Critical Error during resume generation:", error);
        return new Response(
            JSON.stringify({
                message:
                    "An unexpected error occurred while generating the resume. Please try again later.",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}

/*
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
*/
