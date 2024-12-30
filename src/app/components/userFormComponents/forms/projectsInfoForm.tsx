export default function ProjectsInfoForm() {
    return (
        <div>
            <p>Projects</p>
            <input type="text" name="project" placeholder="Project" />
            <input type="url" name="project_link" placeholder="Link" />
            <input
                type="date"
                name="project_start_date"
                placeholder="Start Date"
            />
            <input type="date" name="project_end_date" placeholder="End Date" />
            <input type="text" name="technologies" placeholder="Technologies" />
            <input
                type="text"
                name="project_description"
                placeholder="Description"
            />
        </div>
    );
}
