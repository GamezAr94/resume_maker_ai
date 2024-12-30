export default function EducationInfoForm() {
    return (
        <div>
            <p>Education</p>
            <input type="text" name="school" placeholder="School" />
            <input type="text" name="degree" placeholder="Degree" />
            <input type="date" name="edu_start_date" placeholder="Start Date" />
            <input type="checkbox" name="is_current" />
            <input type="date" name="edu_end_date" placeholder="End Date" />
            <input type="text" name="grades" placeholder="Grades" />
        </div>
    );
}
