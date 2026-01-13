import { redirect } from "react-router";
import { createStation } from "../../api/adminStations";
import { parseStationFormData } from "./stationFormUtils";

// Handles add-station submissions for admins.
export async function addStationAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const parsed = parseStationFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const result = await createStation(parsed.payload);
  if (!result.ok) {
    return { error: result.error || "Could not create station." };
  }

  return redirect("/admin");
}
