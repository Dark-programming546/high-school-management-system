import StaffLoginPage from './StaffLoginPage.jsx';

export default function ViceDirectorLogin() {
  return (
    <StaffLoginPage
      role="vicedirector"
      title="Vice Director Login"
      color="indigo"
      redirectPath="/director/dashboard"
      demoUsername="vicedirector"
      demoPassword="vicedirector123"
    />
  );
}
