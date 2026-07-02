import { useState } from "react";
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
import { useAuth } from "@/src/context/AuthContext";
import { AppDialog } from "@/src/components/AppDialog";
import { useSubscription, type PaidPlanId } from "@/src/hooks/useSubscription";
import { PLANS, COMPARISON_FEATURES, type PlanId } from "@/src/data/plansData";
import { styles } from "./PlansScreen.styles";

const PLAN_NAME: Record<PaidPlanId, string> = {
  premium: "Aventurero",
  pro: "Experto",
};

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
  const { token } = useAuth();
  const { record, loading: checkingSubscription, activate, cancel } = useSubscription();
  const [activatingPlan, setActivatingPlan] = useState<PaidPlanId | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const hasActiveSubscription = !!record?.activa;
  const activePlanId = hasActiveSubscription ? record!.plan : null;
  const trialEndDate = record?.fin ? formatDate(record.fin.toDate()) : null;

  const doActivatePlan = async (planId: PaidPlanId) => {
    setActivatingPlan(planId);
    try {
      await activate(planId);
    } catch {
      Alert.alert("Error", "No se pudo activar el plan. Intentá de nuevo.");
    } finally {
      setActivatingPlan(null);
    }
  };

  const handleActivatePlan = (planId: PaidPlanId) => {
    if (!token) {
      Alert.alert(
        "Iniciá sesión",
        "Necesitás una cuenta para contratar un plan.",
        [{ text: "Entendido" }]
      );
      return;
    }

    if (activePlanId === planId) return;

    const message =
      planId === "premium"
        ? "Tendrás 30 días de acceso completo al plan Aventurero sin cargo."
        : "Vas a activar el plan Experto (sin pasarela de pago real todavía, es solo para probar el flujo).";

    if (Platform.OS === "web") {
      void doActivatePlan(planId);
      return;
    }

    Alert.alert(
      planId === "premium" ? "Activar prueba gratuita" : "Contratar plan Experto",
      message,
      [
        { text: "Cancelar", style: "cancel" },
        { text: planId === "premium" ? "Activar" : "Contratar", onPress: () => void doActivatePlan(planId) },
      ]
    );
  };

  const doCancelSubscription = async () => {
    setCancelling(true);
    try {
      await cancel();
    } catch {
      Alert.alert("Error", "No se pudo finalizar la suscripción. Intentá de nuevo.");
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelSubscription = () => {
    if (Platform.OS === "web") {
      setShowCancelModal(true);
      return;
    }
    Alert.alert(
      "Finalizar suscripción",
      `Vas a perder el acceso al plan ${activePlanId ? PLAN_NAME[activePlanId] : ""} de inmediato. ¿Querés continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Finalizar", style: "destructive", onPress: () => void doCancelSubscription() },
      ]
    );
  };

  const getPlanButtonProps = (planId: PlanId) => {
    if (planId === "free") {
      return { label: "Tu plan actual", disabled: true, variant: "disabled" as const };
    }
    if (checkingSubscription) {
      return { label: "Cargando...", disabled: true, variant: "disabled" as const };
    }
    if (activePlanId === planId) {
      return { label: "Plan activo", disabled: true, variant: "disabled" as const };
    }
    if (planId === "premium") {
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

        {/* Active subscription banner */}
        {showCancelModal && (
          <AppDialog
            title="Finalizar suscripción"
            message={`Vas a perder el acceso al plan ${activePlanId ? PLAN_NAME[activePlanId] : ""} de inmediato. ¿Querés continuar?`}
            icon="warning-outline"
            variant="danger"
            confirmLabel="Finalizar"
            onConfirm={() => { setShowCancelModal(false); void doCancelSubscription(); }}
            onCancel={() => setShowCancelModal(false)}
          />
        )}
        {hasActiveSubscription && activePlanId && (
          <View style={styles.successBanner}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.successText}>¡Plan {PLAN_NAME[activePlanId]} activo!</Text>
              <Text style={styles.successSubtext}>
                {trialEndDate
                  ? `Tu acceso vence el ${trialEndDate}.`
                  : "Tu suscripción está activa."}
              </Text>
              <Pressable
                onPress={handleCancelSubscription}
                disabled={cancelling}
                style={{ marginTop: 10, alignSelf: "flex-start" }}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#14342B" />
                ) : (
                  <Text style={{ color: "#14342B", fontWeight: "700", fontSize: 13, textDecorationLine: "underline" }}>
                    Finalizar suscripción
                  </Text>
                )}
              </Pressable>
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
                  (btn.disabled || activatingPlan === plan.id) && { opacity: activatingPlan === plan.id ? 0.7 : 1 },
                ]}
                onPress={
                  plan.id === "premium" || plan.id === "pro"
                    ? () => handleActivatePlan(plan.id as PaidPlanId)
                    : undefined
                }
                disabled={btn.disabled || activatingPlan !== null}
              >
                {activatingPlan === plan.id ? (
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

              {plan.id === "premium" && activePlanId !== "premium" && (
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
