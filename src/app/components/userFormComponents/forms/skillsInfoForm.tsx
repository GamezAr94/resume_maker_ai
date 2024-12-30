export default function SkillsInfoForm() {
    return (
        <div>
            <p>Skills</p>
            <input type="text" name="skill" placeholder="Skill" />
            <input
                type="number"
                name="level"
                min="0"
                max="10"
                placeholder="Level"
            />
        </div>
    );
}
