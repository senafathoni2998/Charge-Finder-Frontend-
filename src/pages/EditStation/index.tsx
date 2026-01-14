import { useActionData, useNavigate, useNavigation, useParams } from "react-router";
import type { EditStationActionData } from "./types";
import { CONNECTOR_OPTIONS } from "../MainPage/constants";
import EditStationFormSection from "./components/EditStationFormSection";
import EditStationLayout from "./components/EditStationLayout";
import EditStationLoadingState from "./components/EditStationLoadingState";
import EditStationNotFoundState from "./components/EditStationNotFoundState";
import useEditStationFormState from "./hooks/useEditStationFormState";
import useEditStationLoader from "./hooks/useEditStationLoader";

export { editStationAction } from "./editStationRoute";

// Edit station page container that wires form state and layout components.
export default function EditStationPage() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData() as EditStationActionData | undefined;
  const { stationId } = useParams();

  const defaultConnectorType = CONNECTOR_OPTIONS[0] ?? "CCS2";
  const { station, loading, error } = useEditStationLoader(stationId);
  const {
    values,
    handlers,
    onSubmit,
    formError,
    locationCenter,
    onRequestLocation,
    onPickLocation,
    addressLookupLoading,
    locationLoading,
    locationError,
  } = useEditStationFormState(station, defaultConnectorType);

  const submitError = formError || actionData?.error || null;
  const isSubmitting = navigation.state === "submitting";

  // Navigates back to the admin dashboard.
  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  if (loading) {
    return (
      <EditStationLayout>
        <EditStationLoadingState />
      </EditStationLayout>
    );
  }

  if (!station) {
    return (
      <EditStationLayout>
        <EditStationNotFoundState
          errorMessage={error}
          onBack={handleBackToAdmin}
        />
      </EditStationLayout>
    );
  }

  return (
    <EditStationLayout>
      <EditStationFormSection
        values={values}
        handlers={handlers}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={handleBackToAdmin}
        stationId={station.id}
        locationCenter={locationCenter}
        onRequestLocation={onRequestLocation}
        onPickLocation={onPickLocation}
        locationLoading={locationLoading}
        addressLookupLoading={addressLookupLoading}
        locationError={locationError}
      />
    </EditStationLayout>
  );
}
