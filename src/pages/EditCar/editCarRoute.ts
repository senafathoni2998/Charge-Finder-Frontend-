import { redirect } from "react-router";

// Handles edit-car submissions.
export async function editCarAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { error: "Backend URL is not configured." };
  }

  const vehicleId = String(formData.get("vehicleId") || "").trim();
  const userId = String(formData.get("userId") || "").trim();
  const nameRaw = String(formData.get("name") || "").trim();
  const name = nameRaw || "My EV";
  const connectorTypes = formData
    .getAll("connectorTypes")
    .map((value) => String(value))
    .filter((value) => value);
  const minKW = Number.isFinite(Number(formData.get("minKW")))
    ? Number(formData.get("minKW"))
    : 0;
  const batteryCapacityRaw = formData.get("batteryCapacity");
  const batteryCapacityValue =
    typeof batteryCapacityRaw === "string" && batteryCapacityRaw.trim()
      ? Number(batteryCapacityRaw)
      : null;
  const batteryCapacity = Number.isFinite(batteryCapacityValue)
    ? batteryCapacityValue
    : null;

  if (!vehicleId) {
    return { error: "Vehicle is missing." };
  }
  if (!connectorTypes.length) {
    return { error: "Select at least one connector type." };
  }
  if (!userId) {
    return { error: "User session is missing." };
  }

  try {
    const response = await fetch(`${baseUrl}/vehicles/update-vehicle`, {
      method: "PATCH",
      body: JSON.stringify({
        vehicleId,
        userId,
        name,
        connector_type: connectorTypes,
        min_power: minKW,
        ...(batteryCapacity != null ? { batteryCapacity } : {}),
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const vehicle = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: vehicle.message || "Could not update car." };
    }

    return redirect("/profile");
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not update car.",
    };
  }
}
