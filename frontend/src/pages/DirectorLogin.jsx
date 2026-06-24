import StaffLoginPage from './StaffLoginPage.jsx';

export default function DirectorLogin() {
  return (
    <StaffLoginPage
      role="director"
      title="Director Login"
      color="purple"
      redirectPath="/director/dashboard"
      demoUsername="director"
      demoPassword="director123"
    />
  );
}
