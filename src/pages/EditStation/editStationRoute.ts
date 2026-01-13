import { redirect } from "react-router";
import { updateStation } from "../../api/adminStations";
import { parseStationFormData } from "../AddStation/stationFormUtils";

// Handles edit-station submissions for admins.
export async function editStationAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const stationId = String(formData.get("stationId") || "").trim();
  if (!stationId) {
    return { error: "Station ID is missing." };
  }

  const parsed = parseStationFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const result = await updateStation(stationId, parsed.payload);
  if (!result.ok) {
    return { error: result.error || "Could not update station." };
  }

  return redirect("/admin");
}
