'use server';

import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { TOKEN_COSTS } from '@/app/config/costs.config';

export async function POST(req: Request) {
    const supabase = await createClient();

    // Get the user from the request this will help for the authentication of the request
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
        model: 'gemini-2.0-flash',
        //model: "gemini-1.5-pro", // NOTE verify this is the correct model name, I am just guessing
        //model: 'gemini-1.5-flash',
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
    ### Profile Enhancement
    Analyze the user's source profile and identify the single biggest area for improvement. Focus on the quality of their descriptions.
    - If their accomplishment descriptions lack quantifiable metrics (numbers, percentages, dollar amounts), explicitly point this out and provide a formulaic example. For instance: "Your project descriptions are good, but they would be more impactful with metrics. Try to frame them as '[Action] resulted in [Quantifiable Outcome] by [Method].'"
    - If they describe tasks instead of impact, explain the difference. For example: "Shift your focus from listing tasks (e.g., 'managed the database') to describing the outcome (e.g., 'Improved query performance by 30% by restructuring the database schema')."

    ### Bridging the Gap
    Identify the most significant gap between the user's current profile and the requirements of the target job description. Suggest a concrete, small-scale project the user could undertake to fill this gap.
    - Be specific. Don't just say "learn a skill." Instead, suggest a tangible project.
    - Example for a front-end role missing data visualization experience: "To align more closely with this role's need for data visualization, consider building a personal dashboard that pulls data from a public API (like a crypto tracker or a public health dataset) and displays it using a library like Chart.js or D3.js. This would be a powerful talking point in an interview."
    - Give a probability of getting a call from this job offer with the current user's information in Percentages from 0% to 100%

    ### Company-Specific Preparation
    Based on the company name and job description, provide targeted advice for the interview process. (please specify if you dont know the company or you are unsure of which company)
    - If the company has a well-known culture or set of values (e.g., Amazon's Leadership Principles, Netflix's Culture Memo), tell the user to prepare specific examples from their career that align with those values.
    - Suggest specific technical topics to review that are relevant to the company's known tech stack or business domain.
    - Example: "As you're applying to [Company Name], which is a leader in [Industry], be prepared to discuss concepts like [Specific Tech Concept #1] and [Specific Tech Concept #2]. Reviewing their engineering blog for recent articles on these topics would be highly beneficial."

    Ensure the overall tone is constructive, encouraging, and highly professional.

    explanation (String):
    Start with a 1-2 sentence summary of the core strategy used. For example: "The primary strategy for this resume was to frame you as a [Primary Archetype, e.g., 'Product-Minded Engineer'] by highlighting your direct contributions to [Key Business Outcome, e.g., 'user engagement and platform security'], which directly aligns with the core requirements of the job description."

    ### Section-by-Section Rationale
    Provide a bulleted list explaining the key decisions for the most important sections:
    - **Professional Summary:** Briefly state the 'hook' identified in the job description and explain why the selected accomplishment from the user's profile was the perfect evidence to lead with.
    - **Experience & Projects:** Justify why specific roles and projects were prioritized. Most importantly, comment on the quality of the user's source data. If you had to significantly enhance a user's description, point it out as a learning moment. For example: "Your role at Acme Corp was prioritized as it directly addressed the need for 'scalable systems'. Note that I transformed your original point 'Wrote backend services' into 'Architected and deployed microservices that improved API response time by 30%.' This demonstrates quantifiable impact, which is critical. Providing more metrics like this in your master profile will make future resumes even stronger."
    - **Skills:** Explain why the skills are ordered in this specific way, referencing the job description. For example: "The skills list was sequenced to immediately present the technologies explicitly mentioned in the job's 'must-have' qualifications, such as 'React' and 'AWS'."

    ### How to Improve Your Master Profile
    Conclude with 1-2 highly actionable suggestions for the user to improve their source data for next time. This should focus on the information they provide, not their career path.
    - Example 1 (if lacking metrics): "To get even better results, revisit your experience and project descriptions in your master profile. For each accomplishment, ask yourself: 'How can I measure this?' Think in terms of percentages, dollar amounts, user numbers, or time saved."
    - Example 2 (if lacking detail): "Your 'Data Analysis Project' is promising. To make it more powerful, add details about the size of the dataset you worked with, the specific tools you used (e.g., Python with Pandas, SQL), and the key insight you discovered."

    layout (Object):

        This object will contain the visual and textual content of the resume itself.

        narrative (Object):
    title: "Professional Summary",
    display: true,
    items: This summary must be a compelling and unique 2-4 sentence narrative. Do not use a generic template. You must follow these steps to construct it:
        
        1.  **Identify the Core Hook:** Scrutinize the target job description to find one of the following:
            * **The Company's Mission:** What is their main goal or product vision (e.g., "to revolutionize people management," "to build the future of cloud gaming")?
            * **A Specific Challenge:** What problem are they trying to solve with this role (e.g., "scaling our microservices architecture," "improving our data pipeline")?
            * **A Key Value:** What cultural value do they emphasize (e.g., "passion for user privacy," "a culture of mentorship")?

        2.  **Select the Most Relevant Accomplishment:** From the user's master document, find the single best accomplishment or project that directly relates to the "hook" you identified in step 1.

        3.  **Construct the Narrative:** Weave these two elements together. Start with your accomplishment as proof of your ability, then connect it directly to the company's goal or need.

        **Example Construction:**
        * **Job Description Hook:** "We're looking for an engineer to help us scale our secure, high-performance platform."
        * **User's Best Accomplishment:** Implemented 2FA and security features for 50,000+ users.
        * **Resulting Summary:** "A results-oriented Software Engineer with a proven track record in enhancing platform security, demonstrated by implementing a 2FA system for over 50,000 active users. Eager to apply this expertise in building robust, scalable systems to contribute to [Company Name]'s mission of delivering high-performance, secure solutions."

        experience (Object):
            title: Use a standard title like "Work Experience" or "Professional Experience."
            display: Set to true.
            items (Array of Objects):
                Select up to four of the most relevant job experiences from the user's profile, ordered from most to least relevant to the target job.
                For each item, set display to true. You must ensure at least three experiences are set to true if available and if available up to 3 more with display false.
                responsabilities: This is the most critical part. Your goal is to transform the user's descriptions into 3-5 high-impact bullet points per role. You must avoid listing simple tasks. For each bullet point you generate, you will follow this **Hierarchy of Impact**:

                1.  Select up to THREE of the user's most relevant job experiences.
                2.  For each job, generate 3-5 high-impact bullet points... // Your "Hierarchy of Impact" logic follows here.
                3.  After generating the bullet points, reorder them so the accomplishment that most directly addresses the job's #1 requirement appears FIRST.

                **Priority #1: Use Quantifiable Data (if available)**
                Your first priority is to find a specific metric. Scour the user's text for any numbers, percentages, dollar amounts, or time saved (e.g., "increased sales by 13%", "reduced query time by 300ms", "saved 5 hours per week").
                * **Formula:** [Action Verb] + [what you did] + [to achieve a Quantifiable Result].
                * **Example:** "Re-engineered the MagicMail search functionality, reducing average query time by 60% and cutting search-related user errors by 25%."

                **Priority #2: Describe Scope and Scale (if no metrics)**
                If no specific number is available, your next priority is to describe the scale of the project. Look for details about the number of users, the size of the codebase, the amount of data, the importance to the company, or the size of the team.
                * **Formula:** [Action Verb] + [what you did] + [in the context of a large or important system].
                * **Example:** "Engineered a secure and robust two-factor authentication (2FA) system to protect over 50,000 active user accounts on the company's flagship webmail platform."

                **Priority #3: Highlight Technology and Complexity (if no scope or metrics)**
                If the source text has neither a metric nor a clear scale, your fallback is to highlight the technical complexity and purpose. Mention specific technologies used to solve a challenging problem or meet a business need.
                * **Formula:** [Action Verb] + [a key feature] + [using Specific, Impressive Technology] + [to solve a Business Problem].
                * **Example:** "Architected a new Progressive Web App (PWA) using React and TypeScript to modernize the user experience and create a new channel for real-time push notifications."

                **Final Rule:** Under no circumstances should you generate a simple task like "Wrote code for features" or "Maintained the platform." Every bullet point must clearly communicate value through **quantifiable results**, **scope**, or **technical complexity**.


        education (Object):
            title: Use the title "Education."
            display: Set to true.
            items (Array of Objects):
                List the user's relevant educational background.
                show if available 3 with display true and up to 5 with display false
                For each item, set display to true.
            Do NOT forget to include the Field of study, do not put only the school name and the degree type, but also include the name of the degree in your response either in the Degree or School elements

        skills (Object):
            title: Use the title "Skills."
            display: Set to true.
            items (Array of Strings):
                Analyze the job description to identify all required skills and technologies. From the user's master list, you must compile and order the skills with a clear priority (minimum 10 up to 25 skills):
                1.  **Prioritized Skills:** First, list all skills that are explicitly mentioned in the job description's 'requirements' or 'qualifications' section.
                2.  **Remaining Skills:** Then, list the other relevant skills from the user's profile.
            NOTE: just list the skills, do not add text that is not part of the skills like grouping names etc, 

        projects (Object):
            title: Use a title like "Projects" or "Key Projects."
            display: Set to true.
            items (Array of Objects):
                Select up to four of the most relevant projects, ordered from most to least relevant.
                For each item, set display to true. You must ensure at least TWO projects (max 4) are set to true if available.

                1.  Analyze the job description for its core technical requirements.
                2.  You MUST select the TWO projects from the user's master list that most directly showcase these specific requirements.
                3.  **Example of strategic choice:** If a job requires "AWS and containerization," you MUST select a "Homelab" project over a "Freelance E-commerce" project, even if the e-commerce project has stronger sales metrics.
                4.  For each project's description, create a 2-3 sentence summary using the "Hierarchy of Impact" logic.

                **Priority #1: Use Quantifiable Data (if available)**
                Your first priority is to find a specific metric. Scour the user's text for any numbers, percentages, dollar amounts, or time saved (e.g., "increased sales by 13%", "reduced query time by 300ms", "saved 5 hours per week").
                * **Formula:** [Action Verb] + [what you did] + [to achieve a Quantifiable Result].
                * **Example:** "Re-engineered the MagicMail search functionality, reducing average query time by 60% and cutting search-related user errors by 25%."

                **Priority #2: Describe Scope and Scale (if no metrics)**
                If no specific number is available, your next priority is to describe the scale of the project. Look for details about the number of users, the size of the codebase, the amount of data, the importance to the company, or the size of the team.
                * **Formula:** [Action Verb] + [what you did] + [in the context of a large or important system].
                * **Example:** "Engineered a secure and robust two-factor authentication (2FA) system to protect over 50,000 active user accounts on the company's flagship webmail platform."

                **Priority #3: Highlight Technology and Complexity (if no scope or metrics)**
                If the source text has neither a metric nor a clear scale, your fallback is to highlight the technical complexity and purpose. Mention specific technologies used to solve a challenging problem or meet a business need.
                * **Formula:** [Action Verb] + [a key feature] + [using Specific, Impressive Technology] + [to solve a Business Problem].
                * **Example:** "Architected a new Progressive Web App (PWA) using React and TypeScript to modernize the user experience and create a new channel for real-time push notifications."

                **Final Rule:** Under no circumstances should you generate a simple task like "Wrote code for features" or "Maintained the platform." Every bullet point must clearly communicate value through **quantifiable results**, **scope**, or **technical complexity**.
                d if possible 3 with display false.
        `,
    });

    // with this configuration you can configure the responses of gemini
    const generationConfig = {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        // NOTE I checked on the gemini studio the number of tokens for a resume that I found on the
        // internet and it was around 500 tokens. I am going to use 2000 tokens to be safe
        maxOutputTokens: 3500,
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

        // --- TOKEN COUNTING LOGIC ---
        // Access the usage metadata from the response
        const usageMetadata = result.response.usageMetadata;
        if (usageMetadata) {
            console.log('Token Usage:');
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
