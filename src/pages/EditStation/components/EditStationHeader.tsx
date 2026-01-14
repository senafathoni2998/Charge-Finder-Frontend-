import StationHeader from "../../AddStation/components/StationHeader";

type EditStationHeaderProps = {
  subtitle?: string;
};

// Renders the shared header for the edit-station flow.
export default function EditStationHeader({
  subtitle = "Update station details and keep the network accurate.",
}: EditStationHeaderProps) {
  return <StationHeader title="Edit station" subtitle={subtitle} />;
}
