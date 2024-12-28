export default function WorkInfoForm() {
    return (
        <div>
            <p>Work Experience</p>
            <input type="text" name="company" placeholder="Company" />
            <input type="text" name="position" placeholder="Position" />
            <input type="date" name="start_date" placeholder="Start Date" />
            <input type="date" name="end_date" placeholder="End Date" />
            <input type="text" name="description" placeholder="Description" />
        </div>
    );
}
