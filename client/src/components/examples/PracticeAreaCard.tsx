import PracticeAreaCard from "../PracticeAreaCard";

export default function PracticeAreaCardExample() {
  return (
    <PracticeAreaCard
      id="civil"
      title="Diritto civile e commerciale"
      items={[
        "Diritto civile generale",
        "Obbligazioni e contratti",
        "Responsabilità civile",
        "Assicurazione e risarcimento del danno",
        "Diritto dei consumatori",
        "Famiglia e successioni",
        "Condominio e locazioni",
      ]}
    />
  );
}
