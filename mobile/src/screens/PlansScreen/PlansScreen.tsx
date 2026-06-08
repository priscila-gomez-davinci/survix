import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/src/services/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { PLANS, COMPARISON_FEATURES, type PlanId } from "@/src/data/plansData";
import { styles } from "./PlansScreen.styles";

type TrialRecord = {
  activa: boolean;
  fin: Timestamp;
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Ionicons name="checkmark-circle" size={18} color="#18B678" />;
  }
  if (value === false) {
    return <Ionicons name="remove-circle-outline" size={18} color="#C5D4CE" />;
  }
  return <Text style={styles.tableRowCellText}>{value}</Text>;
}

export default function PlansScreen() {
  const { user, token } = useAuth();
  const [trialRecord, setTrialRecord] = useState<TrialRecord | null>(null);
  const [checkingTrial, setCheckingTrial] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!user) {
      setCheckingTrial(false);
      return;
    }
    const ref = doc(db, "pruebas_premium", String(user.id_usuario));
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          setTrialRecord(snap.data() as TrialRecord);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingTrial(false));
  }, [user]);

  const hasActiveTrial = !!trialRecord?.activa;
  const trialEndDate = trialRecord?.fin
    ? formatDate(trialRecord.fin.toDate())
    : null;

  const handleStartTrial = () => {
    if (!token || !user) {
      Alert.alert(
        "Iniciá sesión",
        "Necesitás una cuenta para activar la prueba gratuita.",
        [{ text: "Entendido" }]
      );
      return;
    }

    if (hasActiveTrial) return;

    const confirmMessage =
      Platform.OS === "web"
        ? undefined
        : "Tendrás 30 días de acceso completo al plan Aventurero sin cargo.";

    if (Platform.OS === "web") {
      void doActivateTrial();
      return;
    }

    Alert.alert(
      "Activar prueba gratuita",
      confirmMessage!,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Activar", onPress: () => void doActivateTrial() },
      ]
    );
  };

  const doActivateTrial = async () => {
    if (!user) return;
    setActivating(true);
    try {
      const now = new Date();
      const end = addDays(now, 30);
      const ref = doc(db, "pruebas_premium", String(user.id_usuario));
      await setDoc(ref, {
        id_usuario: user.id_usuario,
        email: user.email,
        plan: "premium",
        inicio: serverTimestamp(),
        fin: Timestamp.fromDate(end),
        activa: true,
      });
      setTrialRecord({ activa: true, fin: Timestamp.fromDate(end) });
    } catch {
      Alert.alert("Error", "No se pudo activar la prueba. Intentá de nuevo.");
    } finally {
      setActivating(false);
    }
  };

  const getPlanButtonProps = (planId: PlanId) => {
    if (planId === "free") {
      return { label: "Tu plan actual", disabled: true, variant: "disabled" as const };
    }
    if (planId === "premium") {
      if (checkingTrial) return { label: "Cargando...", disabled: true, variant: "disabled" as const };
      if (hasActiveTrial) return { label: "Prueba activa", disabled: true, variant: "disabled" as const };
      return { label: "Comenzar prueba gratuita", disabled: false, variant: "primary" as const };
    }
    return { label: "Contratar", disabled: false, variant: "secondary" as const };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Planes y precios</Text>
          <Text style={styles.heroTitle}>Elegí el plan que mejor se adapta a vos</Text>
          <Text style={styles.heroSubtitle}>
            Probá el plan Aventurero gratis por 30 días, sin tarjeta de crédito.
          </Text>
        </View>

        {/* Trial active banner */}
        {hasActiveTrial && trialEndDate && (
          <View style={styles.successBanner}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.successText}>¡Prueba gratuita activa!</Text>
              <Text style={styles.successSubtext}>
                Tu acceso al plan Aventurero vence el {trialEndDate}.
              </Text>
            </View>
          </View>
        )}

        {/* Plan cards */}
        {PLANS.map((plan) => {
          const btn = getPlanButtonProps(plan.id);
          return (
            <View
              key={plan.id}
              style={[styles.planCard, plan.highlighted && styles.planCardHighlighted]}
            >
              {plan.highlighted && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>Recomendado</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{plan.priceLabel}</Text>
                <Text style={styles.planBilling}>{plan.billingLabel}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresList}>
                {plan.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#18B678" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={[
                  styles.planButton,
                  btn.variant === "primary" && styles.planButtonPrimary,
                  btn.variant === "secondary" && styles.planButtonSecondary,
                  btn.variant === "disabled" && styles.planButtonDisabled,
                  (btn.disabled || activating) && { opacity: activating && plan.id === "premium" ? 0.7 : 1 },
                ]}
                onPress={plan.id === "premium" ? handleStartTrial : undefined}
                disabled={btn.disabled || activating}
              >
                {activating && plan.id === "premium" ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.planButtonText,
                      btn.variant === "primary" && styles.planButtonTextPrimary,
                      btn.variant === "secondary" && styles.planButtonTextSecondary,
                      btn.variant === "disabled" && styles.planButtonTextDisabled,
                    ]}
                  >
                    {btn.label}
                  </Text>
                )}
              </Pressable>

              {plan.id === "premium" && !hasActiveTrial && (
                <Text style={styles.trialNote}>
                  30 días gratis · Sin tarjeta de crédito
                </Text>
              )}
            </View>
          );
        })}

        {/* Comparison table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Comparación de planes</Text>

          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderFeature}>Funcionalidad</Text>
            {PLANS.map((plan) => (
              <Text
                key={plan.id}
                style={[
                  styles.tableHeaderPlan,
                  plan.highlighted && styles.tableHeaderPlanHighlighted,
                ]}
              >
                {plan.name}
              </Text>
            ))}
          </View>

          {COMPARISON_FEATURES.map((feature, index) => (
            <View
              key={feature.label}
              style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}
            >
              <Text style={styles.tableRowFeature}>{feature.label}</Text>
              <View style={styles.tableRowCell}>
                <CellValue value={feature.free} />
              </View>
              <View style={styles.tableRowCell}>
                <CellValue value={feature.premium} />
              </View>
              <View style={styles.tableRowCell}>
                <CellValue value={feature.pro} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
