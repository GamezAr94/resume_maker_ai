import WorkInfoForm from './workInfoForm';
import EducationInfoForm from './educationInfoForm';
import ProjectsInfoForm from './projectsInfoForm';
import SkillsInfoForm from './skillsInfoForm';
import PersonalInfoForm from './personalInfoForm';

export default function UserInfoForm() {
    return (
        <div>
            <PersonalInfoForm />
            <WorkInfoForm />
            <EducationInfoForm />
            <SkillsInfoForm />
            <ProjectsInfoForm />
        </div>
    );
}
