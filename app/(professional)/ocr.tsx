import { showAppAlert } from "@/src/components/AppAlert";
import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
import {
  Card,
  InfoBanner,
  PageHeader,
  PrimaryButton,
  Screen,
  SecondaryButton,
  screenScrollContent,
} from "@/src/components/ui";
import { brand } from "@/src/theme/brand";
import { useAuth } from "@/src/contexts/AuthContext";
import { formatIsoDatePt } from "@/src/domain/timeHelpers";
import { listPatientsForProfessional } from "@/src/services/patients";
import { extractDiaryFromImage, listOcrJobs } from "@/src/services/ocr";
import type { SonoPatient } from "@/src/types";
import type { OcrJob } from "@/src/types/ocr";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

function ocrNavParams(
  patientId?: string,
  weekId?: string,
  date?: string
): Record<string, string> {
  const params: Record<string, string> = {};
  if (patientId) params.patientId = patientId;
  if (weekId) params.weekId = weekId;
  if (date) params.date = date;
  return params;
}

export default function ProfessionalOcrScreen() {
  const { user } = useAuth();
  const { patientId, date: dateParam, weekId: weekIdParam } =
    useLocalSearchParams<{
      patientId?: string;
      date?: string;
      weekId?: string;
    }>();
  const targetDate = typeof dateParam === "string" ? dateParam : undefined;
  const weekId =
    typeof weekIdParam === "string" && weekIdParam ? weekIdParam : undefined;

  const [patients, setPatients] = useState<SonoPatient[]>([]);
  const [selected, setSelected] = useState<SonoPatient | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<OcrJob[]>([]);

  const lockedToPatient = Boolean(patientId);

  const subtitle = useMemo(() => {
    if (lockedToPatient && selected) {
      return targetDate
        ? `Foto da folha de ${selected.displayName} · ${formatIsoDatePt(targetDate)}.`
        : `Foto da folha de ${selected.displayName}.`;
    }
    return "Fotografe a folha manuscrita e vincule a um paciente.";
  }, [lockedToPatient, selected, targetDate]);

  const goBack = () => {
    if (patientId && targetDate) {
      router.replace({
        pathname: "/(professional)/patient/[id]/day",
        params: {
          id: patientId,
          date: targetDate,
          ...(weekId ? { weekId } : {}),
        },
      });
      return;
    }
    if (patientId) {
      router.replace({
        pathname: "/(professional)/patient/[id]",
        params: { id: patientId, ...(weekId ? { weekId } : {}) },
      });
      return;
    }
    router.back();
  };

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!user) return;
        const list = await listPatientsForProfessional(user.uid);
        if (!alive) return;
        setPatients(list);
        if (patientId) {
          setSelected(list.find((p) => p.patientUid === patientId) ?? null);
        } else {
          setSelected((cur) => cur ?? list[0] ?? null);
        }
        setJobs(
          listOcrJobs().filter((j) =>
            patientId ? j.patientUid === patientId : j.uploadedBy === user.uid
          )
        );
      })();
      return () => {
        alive = false;
      };
    }, [user, patientId])
  );

  const pick = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAppAlert(
        "Permissão",
        fromCamera
          ? "Precisamos da câmara para fotografar a folha."
          : "Precisamos da galeria para escolher a foto."
      );
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.85,
          allowsEditing: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.85,
          allowsEditing: true,
          mediaTypes: ["images"],
        });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onExtract = async () => {
    if (!user || !selected || !imageUri) return;
    try {
      setBusy(true);
      const job = await extractDiaryFromImage({
        imageUri,
        patientUid: selected.patientUid,
        patientName: selected.displayName,
        uploadedBy: user.uid,
        targetDate,
      });
      setJobs(listOcrJobs().filter((j) => j.uploadedBy === user.uid));
      router.push({
        pathname: "/(professional)/ocr-review",
        params: {
          jobId: job.jobId,
          ...ocrNavParams(selected.patientUid, weekId, targetDate),
        },
      });
    } catch (e) {
      showAppAlert("OCR", e instanceof Error ? e.message : "Falha na leitura");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges="top">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={screenScrollContent}
      >
        <PageHeader
          eyebrow="Leitura da folha"
          title="Folha em papel"
          subtitle={subtitle}
          onBack={goBack}
          backLabel={patientId ? "Diário" : "Voltar"}
        />

        <InfoBanner>
          Em demo a leitura é simulada (exemplo do PDF). A IA entra quando
          ligarmos o backend.
        </InfoBanner>

        {lockedToPatient && selected ? (
          <Card className="mt-4">
            <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
              Paciente
            </Text>
            <Text className="mt-1 font-sansBold text-lg text-sleep-ink">
              {selected.displayName}
            </Text>
            <Text className="mt-1 font-sans text-xs text-sleep-muted">
              {targetDate
                ? `Os dados vão para o dia ${formatIsoDatePt(targetDate)} após você revisar.`
                : "Já definido pelo diário que você abriu."}
            </Text>
          </Card>
        ) : (
          <Card className="mt-4">
            <Text className="mb-3 font-sansMed text-sleep-ink">
              Paciente da folha
            </Text>
            {patients.length === 0 ? (
              <EmptyState
                image={emptyStateImages.rest}
                title="Nenhum paciente ainda"
                message="Quando alguém vincular o seu código no Perfil, aparece aqui para você ler a folha."
              />
            ) : (
              <View className="gap-2">
                {patients.map((p) => (
                  <Pressable
                    key={p.patientUid}
                    onPress={() => setSelected(p)}
                    className={`rounded-2xl border px-3 py-3 ${
                      selected?.patientUid === p.patientUid
                        ? "border-sleep-accent bg-sleep-accent"
                        : "border-sleep-line bg-sleep-bgDeep/70"
                    }`}
                  >
                    <Text
                      className={`font-sansMed ${
                        selected?.patientUid === p.patientUid
                          ? "text-sleep-bg"
                          : "text-sleep-ink"
                      }`}
                    >
                      {p.displayName}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Card>
        )}

        <Card className="mt-4">
          <Text className="mb-3 font-sansMed text-sleep-ink">Foto da folha</Text>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="mb-3 h-48 w-full rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="mb-3 overflow-hidden rounded-xl border border-dashed border-sleep-line">
              <EmptyState
                image={emptyStateImages.ginkgo}
                title="Pronta para fotografar"
                message="Boa luz, folha inteira visível — como na consulta."
              />
            </View>
          )}
          <View className="gap-2">
            <PrimaryButton
              label="Tirar foto"
              onPress={() => void pick(true)}
              disabled={!selected}
            />
            <SecondaryButton
              label="Escolher da galeria"
              onPress={() => void pick(false)}
            />
          </View>
        </Card>

        <View className="mt-4">
          {busy ? (
            <View className="items-center py-4">
              <ActivityIndicator color={brand.argila} />
              <Text className="mt-2 font-sans text-sm text-sleep-muted">
                Lendo a folha…
              </Text>
            </View>
          ) : (
            <PrimaryButton
              label="Ler e revisar"
              onPress={() => void onExtract()}
              disabled={!selected || !imageUri}
            />
          )}
        </View>

        {jobs.length > 0 ? (
          <Card className="mt-6">
            <Text className="mb-2 font-sansMed text-sleep-ink">
              Leituras recentes
            </Text>
            {jobs.slice(0, 5).map((j) => (
              <Pressable
                key={j.jobId}
                onPress={() =>
                  router.push({
                    pathname: "/(professional)/ocr-review",
                    params: {
                      jobId: j.jobId,
                      ...ocrNavParams(j.patientUid, weekId, targetDate),
                    },
                  })
                }
                className="border-b border-sleep-line py-3"
              >
                <Text className="font-sansMed text-sleep-ink">
                  {j.patientName}
                </Text>
                <Text className="mt-0.5 font-sans text-xs text-sleep-muted">
                  {j.status} · {j.draftDays.length} dia(s)
                </Text>
              </Pressable>
            ))}
          </Card>
        ) : null}
      </AppScrollView>
    </Screen>
  );
}
