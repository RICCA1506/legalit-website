import ProfessionalCard from "../ProfessionalCard";

export default function ProfessionalCardExample() {
  return (
    <ProfessionalCard
      name="Avv. Luigi Passalacqua"
      title="Partner"
      specializations={["civil-commercial"]}
      office="Roma"
      email="l.passalacqua@legalit.it"
      imageUrl="/attached_assets/avv-luigi-passalacqua.jpg"
    />
  );
}
