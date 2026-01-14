import { useMemo } from "react";
import {
  useActionData,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router";
import { useAppSelector } from "../../app/hooks";
import type { EditCarActionData } from "./types";
import EditCarFormSection from "./components/EditCarFormSection";
import EditCarLayout from "./components/EditCarLayout";
import EditCarNotFound from "./components/EditCarNotFound";
import useEditCarFormState from "./hooks/useEditCarFormState";
import { findCarById } from "./utils";

export { editCarAction } from "./editCarRoute";

// Edit car page container that wires form state and layout components.
export default function EditCarPage() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData() as EditCarActionData | undefined;
  const { carId } = useParams();
  const email = useAppSelector((state) => state.auth.email) || "";
  const userId = useAppSelector((state) => state.auth.userId) || "";
  const cars = useAppSelector((state) => state.auth.cars);

  const car = useMemo(
    () => findCarById(cars, carId),
    [cars, carId]
  );

  const { values, handlers, onSubmit, clientError } =
    useEditCarFormState(car);

  const submitError = clientError || actionData?.error || null;
  const isSubmitting = navigation.state === "submitting";

  // Sends the user back to their profile when cancelling.
  const handleBackToProfile = () => {
    navigate("/profile");
  };

  return (
    <EditCarLayout>
      {car ? (
        <EditCarFormSection
          values={values}
          handlers={handlers}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={handleBackToProfile}
          userId={userId}
          email={email}
          vehicleId={car.id}
        />
      ) : (
        <EditCarNotFound onBack={handleBackToProfile} />
      )}
    </EditCarLayout>
  );
}
