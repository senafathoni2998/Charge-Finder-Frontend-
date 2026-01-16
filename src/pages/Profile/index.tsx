import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Alert, Box, Snackbar, Stack, Typography } from "@mui/material";
import { useActionData, useLoaderData, useNavigate } from "react-router";
import { UI } from "../../theme/theme";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  removeCar,
  setActiveCar,
  setCars,
  updateProfile,
} from "../../features/auth/authSlice";
import type { UserCar } from "../../features/auth/authSlice";
import { passwordIssue, strengthLabel } from "../../utils/validate";
import type { ProfileActionData, ProfileLoaderData } from "./types";
import {
  persistCarsToStorage,
  persistProfileToStorage,
} from "./profileStorage";
import { deleteVehicleRequest, setActiveVehicleRequest } from "./vehicleRequests";
import { fetchVehicleById } from "../../api/vehicles";
import ProfileOverviewCard from "./components/ProfileOverviewCard";
import CarsCard from "./components/CarsCard";
import EditProfileDialog from "./components/EditProfileDialog";
import ChangePasswordDialog from "./components/ChangePasswordDialog";

export { profileAction, profileLoader } from "./profileRoute";

const CHARGING_VEHICLE_REFRESH_MS = 60000;

const normalizeVehicle = (vehicle: unknown): UserCar | null => {
  if (!vehicle || typeof vehicle !== "object") return null;
  const data = vehicle as Record<string, unknown>;
  const id =
    typeof data.id === "string"
      ? data.id.trim()
      : typeof data.id === "number"
      ? String(data.id)
      : "";
  if (!id) return null;
  const name =
    typeof data.name === "string" && data.name.trim()
      ? data.name.trim()
      : "My EV";
  const connectorTypes = Array.isArray(data.connector_type)
    ? (data.connector_type as UserCar["connectorTypes"])
    : [];
  const minKW = Number.isFinite(Number(data.min_power))
    ? Number(data.min_power)
    : 0;
  const chargingStatus =
    typeof data.chargingStatus === "string" && data.chargingStatus.trim()
      ? data.chargingStatus.trim()
      : typeof data.charging_status === "string" &&
        data.charging_status.trim()
      ? data.charging_status.trim()
      : null;
  const isActive =
    typeof data.isActive === "boolean"
      ? data.isActive
      : typeof data.active === "boolean"
      ? data.active
      : typeof data.is_active === "boolean"
      ? data.is_active
      : false;
  const batteryPercentRaw =
    typeof data.batteryPercent === "number"
      ? data.batteryPercent
      : typeof data.batteryPercent === "string"
      ? Number(data.batteryPercent)
      : typeof data.battery_percent === "number"
      ? data.battery_percent
      : typeof data.battery_percent === "string"
      ? Number(data.battery_percent)
      : Number.NaN;
  const batteryPercent = Number.isFinite(batteryPercentRaw)
    ? Number(batteryPercentRaw)
    : null;
  const batteryStatus =
    typeof data.batteryStatus === "string" && data.batteryStatus.trim()
      ? data.batteryStatus.trim()
      : typeof data.battery_status === "string" &&
        data.battery_status.trim()
      ? data.battery_status.trim()
      : null;
  const lastBatteryUpdatedAt =
    typeof data.lastBatteryUpdatedAt === "string" &&
    data.lastBatteryUpdatedAt.trim()
      ? data.lastBatteryUpdatedAt.trim()
      : typeof data.last_battery_updated_at === "string" &&
        data.last_battery_updated_at.trim()
      ? data.last_battery_updated_at.trim()
      : null;
  return {
    id,
    name,
    connectorTypes,
    minKW,
    chargingStatus,
    batteryPercent,
    batteryStatus,
    lastBatteryUpdatedAt,
    isActive,
  };
};

const isVehicleCharging = (car: UserCar) =>
  typeof car.chargingStatus === "string" &&
  car.chargingStatus.trim().toUpperCase() === "CHARGING";

// Profile page container that wires data, dialogs, and subcomponents together.
export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as ProfileLoaderData | null;
  const actionData = useActionData() as ProfileActionData | undefined;
  const email = useAppSelector((state) => state.auth.email);
  const userId = useAppSelector((state) => state.auth.userId);
  const profileName = useAppSelector((state) => state.auth.name);
  const profileRegion = useAppSelector((state) => state.auth.region);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);
  const [profileOpen, setProfileOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [regionDraft, setRegionDraft] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [carError, setCarError] = useState<string | null>(null);
  const carsRef = useRef(cars);
  const chargingVehicleId = useMemo(
    () => cars.find(isVehicleCharging)?.id ?? null,
    [cars]
  );

  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  const newPwIssue = useMemo(() => passwordIssue(newPassword), [newPassword]);
  const newPwStrength = useMemo(
    () => strengthLabel(newPassword),
    [newPassword]
  );

  const displayName = useMemo(() => {
    console.log("profileName:", profileName);
    if (profileName && profileName.trim()) return profileName.trim();
    if (!email) return "Driver";
    const [name] = email.split("@");
    return name ? name.replace(/[^a-zA-Z0-9]+/g, " ").trim() : "Driver";
  }, [email, profileName]);

  const regionLabel = profileRegion?.trim() || "Jakarta, ID";

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    if (!parts.length) return "D";
    return parts[0].charAt(0).toUpperCase();
  }, [displayName]);

  const handleOpenProfileEditor = () => {
    setNameDraft(profileName?.trim() || displayName);
    setRegionDraft(profileRegion?.trim() || "Jakarta, ID");
    setProfileError(null);
    setProfileOpen(true);
  };

  const handleNameDraftChange = (value: string) => {
    setNameDraft(value);
    if (profileError) setProfileError(null);
  };

  const handleRegionDraftChange = (value: string) => {
    setRegionDraft(value);
  };

  const handleProfileSubmit = (event: FormEvent) => {
    const nextName = nameDraft.trim();
    if (!nextName) {
      event.preventDefault();
      setProfileError("Name is required.");
      return;
    }
    if (profileError) setProfileError(null);
  };

  useEffect(() => {
    if (!loaderData) return;

    const { user, vehicles, activeCarId: storedActiveId } = loaderData;
    if (user && typeof user === "object") {
      const { name, region, role } = user;
      const hasRole = Object.prototype.hasOwnProperty.call(user, "role");
      const nextName =
        typeof name === "string" && name.trim() ? name.trim() : null;
      const nextRegion =
        typeof region === "string" && region.trim() ? region.trim() : null;
      const nextRole = hasRole
        ? typeof role === "string" && role.trim()
          ? role.trim()
          : null
        : undefined;
      if (nextName || nextRegion || nextRole) {
        dispatch(
          updateProfile({
            name: nextName,
            region: nextRegion,
            ...(hasRole ? { role: nextRole } : {}),
          })
        );
        if (hasRole) {
          persistProfileToStorage(nextName, nextRegion, nextRole);
        } else {
          persistProfileToStorage(nextName, nextRegion);
        }
      }
    }

    if (!Array.isArray(vehicles)) return;
    const remappedVehicles = vehicles
      .map((v: unknown) => normalizeVehicle(v))
      .filter((car): car is UserCar => !!car);
    const serverActiveId =
      remappedVehicles.find((car) => car.isActive)?.id ?? null;
    const nextActiveId =
      serverActiveId ||
      (storedActiveId &&
      remappedVehicles.some((car) => car.id === storedActiveId)
        ? storedActiveId
        : remappedVehicles[0]?.id ?? null);
    dispatch(
      setCars({
        cars: remappedVehicles,
        activeCarId: nextActiveId,
      })
    );
    persistCarsToStorage(remappedVehicles, nextActiveId);
  }, [dispatch, loaderData]);

  useEffect(() => {
    if (!actionData) return;

    if (actionData.intent === "profile") {
      if (actionData.error) {
        setProfileError(actionData.error);
        return;
      }
      if (actionData.ok) {
        dispatch(
          updateProfile({
            name: actionData.name ?? null,
            region: actionData.region ?? null,
          })
        );
        persistProfileToStorage(actionData.name ?? null, actionData.region ?? null);
        setProfileOpen(false);
        setProfileError(null);
      }
    }

    if (actionData.intent === "password") {
      if (actionData.error) {
        setPasswordError(actionData.error);
        return;
      }
      if (actionData.ok) {
        setPasswordToast("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordOpen(false);
        setPasswordError(null);
      }
    }
  }, [actionData, dispatch]);

  useEffect(() => {
    if (!chargingVehicleId) return;
    let active = true;
    let controller: AbortController | null = null;
    let isLoading = false;

    const refreshChargingVehicle = async () => {
      if (isLoading) return;
      isLoading = true;
      const nextController = new AbortController();
      controller = nextController;
      const result = await fetchVehicleById(
        chargingVehicleId,
        nextController.signal
      );
      if (!active) return;
      if (result.ok && result.vehicle) {
        const normalized = normalizeVehicle(result.vehicle);
        if (normalized) {
          const nextCars = carsRef.current.map((car) =>
            car.id === normalized.id ? { ...car, ...normalized } : car
          );
          dispatch(
            setCars({
              cars: nextCars,
              activeCarId,
            })
          );
          persistCarsToStorage(nextCars, activeCarId);
        }
      }
      isLoading = false;
    };

    refreshChargingVehicle();
    const intervalId = window.setInterval(
      refreshChargingVehicle,
      CHARGING_VEHICLE_REFRESH_MS
    );
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, [activeCarId, chargingVehicleId, dispatch]);

  const handleOpenPasswordEditor = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordOpen(true);
  };

  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value);
    if (passwordError) setPasswordError(null);
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (passwordError) setPasswordError(null);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (passwordError) setPasswordError(null);
  };

  const handlePasswordSubmit = (event: FormEvent) => {
    setPasswordError(null);
    if (!currentPassword.trim()) {
      event.preventDefault();
      setPasswordError("Enter your current password.");
      return;
    }

    if (newPwIssue) {
      event.preventDefault();
      setPasswordError(newPwIssue);
      return;
    }
    if (!newPassword.trim()) {
      event.preventDefault();
      setPasswordError("Enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      event.preventDefault();
      setPasswordError("Passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      event.preventDefault();
      setPasswordError("New password must be different.");
      return;
    }
  };

  const handleSetActive = async (carId: string) => {
    setCarError(null);
    const result = await setActiveVehicleRequest({ vehicleId: carId, userId });
    if (!result.ok) {
      setCarError(result.error || "Could not update active car.");
      return;
    }
    dispatch(setActiveCar(carId));
    persistCarsToStorage(cars, carId);
  };

  const handleEditCar = (carId: string) => {
    navigate(`/profile/cars/${carId}/edit`);
  };

  const handleRemoveCar = async (carId: string) => {
    setCarError(null);
    const result = await deleteVehicleRequest({ vehicleId: carId, userId });
    if (!result.ok) {
      setCarError(result.error || "Could not delete car.");
      return;
    }

    const nextCars = cars.filter((c) => c.id !== carId);
    const nextActiveId =
      activeCarId === carId ? nextCars[0]?.id ?? null : activeCarId;
    dispatch(removeCar(carId));
    persistCarsToStorage(nextCars, nextActiveId);
  };

  console.log(
    "Rendering ProfilePage with cars:",
    cars,
    "activeCarId:",
    activeCarId
  );

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 28 }}>
              Profile
            </Typography>
            <Typography sx={{ color: UI.text2 }}>
              Manage your account and charging preferences.
            </Typography>
          </Box>

          <ProfileOverviewCard
            displayName={displayName}
            email={email}
            regionLabel={regionLabel}
            initials={initials}
            onEditProfile={handleOpenProfileEditor}
            onChangePassword={handleOpenPasswordEditor}
          />

          <CarsCard
            cars={cars}
            activeCarId={activeCarId}
            onAddCar={() => navigate("/profile/cars/new")}
            onSetActive={handleSetActive}
            onRemove={handleRemoveCar}
            onEdit={handleEditCar}
          />
        </Stack>
      </Box>

      <EditProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSubmit={handleProfileSubmit}
        nameDraft={nameDraft}
        regionDraft={regionDraft}
        profileError={profileError}
        email={email}
        userId={userId}
        onNameChange={handleNameDraftChange}
        onRegionChange={handleRegionDraftChange}
      />

      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSubmit={handlePasswordSubmit}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onCurrentPasswordChange={handleCurrentPasswordChange}
        onNewPasswordChange={handleNewPasswordChange}
        onConfirmPasswordChange={handleConfirmPasswordChange}
        passwordError={passwordError}
        newPwIssue={newPwIssue}
        newPwStrength={newPwStrength}
        userId={userId}
      />

      <Snackbar
        open={!!passwordToast}
        autoHideDuration={4000}
        onClose={() => setPasswordToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setPasswordToast(null)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {passwordToast}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!carError}
        autoHideDuration={4000}
        onClose={() => setCarError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCarError(null)}
          severity="error"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {carError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
