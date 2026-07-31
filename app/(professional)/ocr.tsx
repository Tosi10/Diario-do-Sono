import {
  Card,
  InfoBanner,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";
import { listPatientsForProfessional } from "@/src/services/patients";
import { extractDiaryFromImage, listOcrJobs } from "@/src/services/ocr";
import type { SonoPatient } from "@/src/types";
import type { OcrJob } from "@/src/types/ocr";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

export default function ProfessionalOcrScreen() {
  const { user } = useAuth();
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();
  const [patients, setPatients] = useState<SonoPatient[]>([]);
  const [selected, setSelected] = useState<SonoPatient | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<OcrJob[]>([]);

  const lockedToPatient = Boolean(patientId);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!user) return;
        const list = await listPatientsForProfessional(user.uid);
        if (!alive) return;
        setPatients(list);
        if (patientId) {
          const locked =
            list.find((p) => p.patientUid === patientId) ?? null;
          setSelected(locked);
        } else {
          setSelected((cur) => cur ?? list[0] ?? null);
        }
        setJobs(
          listOcrJobs().filter((j) =>
            patientId
              ? j.patientUid === patientId
              : j.uploadedBy === user.uid
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
      Alert.alert(
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
      });
      setJobs(listOcrJobs().filter((j) => j.uploadedBy === user.uid));
      router.push({
        pathname: "/(professional)/ocr-review",
        params: { jobId: job.jobId },
      });
    } catch (e) {
      Alert.alert("OCR", e instanceof Error ? e.message : "Falha na leitura");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        <Title>Folha em papel</Title>
        <Subtitle>
          {lockedToPatient && selected
            ? `Foto da folha de ${selected.displayName}.`
            : "Fotografe a folha e vincule a um paciente."}
        </Subtitle>

        <View className="mt-3">
          <Pressable onPress={() => router.back()}>
            <Text className="font-sansMed text-sm text-sleep-accent">
              ← Voltar ao diário
            </Text>
          </Pressable>
        </View>

        <View className="mt-4">
          <InfoBanner>
            Em demo a leitura é simulada (exemplo do PDF). A IA (OCR/visão)
            entra quando ligarmos o backend.
          </InfoBanner>
        </View>

        {lockedToPatient && selected ? (
          <Card className="mt-5">
            <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
              Paciente
            </Text>
            <Text className="mt-1 font-sansBold text-lg text-sleep-ink">
              {selected.displayName}
            </Text>
            <Text className="mt-1 font-sans text-xs text-sleep-muted">
              Já definido pelo diário que você abriu.
            </Text>
          </Card>
        ) : (
          <Card className="mt-5">
            <Text className="font-sansMed text-sleep-ink mb-2">
              Paciente da folha
            </Text>
            {patients.length === 0 ? (
              <Text className="font-sans text-sm text-sleep-muted">
                Nenhum paciente vinculado ainda.
              </Text>
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
                          ? "text-sleep-bgDeep"
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
          <Text className="font-sansMed text-sleep-ink mb-3">Foto da folha</Text>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="mb-3 h-48 w-full rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="mb-3 h-36 items-center justify-center rounded-xl border border-dashed border-sleep-line bg-sleep-bgDeep/70">
              <Text className="font-sans text-sm text-sleep-muted">
                Nenhuma foto ainda
              </Text>
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
              <ActivityIndicator color="#A3B899" />
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
            <Text className="font-sansMed text-sleep-ink mb-2">
              Leituras recentes
            </Text>
            {jobs.slice(0, 5).map((j) => (
              <Pressable
                key={j.jobId}
                onPress={() =>
                  router.push({
                    pathname: "/(professional)/ocr-review",
                    params: { jobId: j.jobId },
                  })
                }
                className="border-b border-sleep-line py-3"
              >
                <Text className="font-sansMed text-sleep-ink">
                  {j.patientName}
                </Text>
                <Text className="font-sans text-xs text-sleep-muted mt-0.5">
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
