import StaffLoginPage from './StaffLoginPage.jsx';

export default function RegistrarLogin() {
  return (
    <StaffLoginPage
      role="registrar"
      title="Registrar Login"
      color="green"
      redirectPath="/registrar/dashboard"
      demoUsername="registrar"
      demoPassword="registrar123"
    />
  );
}
