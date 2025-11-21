import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette } from "@/theme/colors";

interface ProgressBarProps {
    currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
    { id: 1, label: "Cursos" },
    { id: 2, label: "Conjuntos" },
    { id: 3, label: "Juegos" },
    { id: 4, label: "Preguntas" },
];

export default function ProgressBar({ currentStep }: ProgressBarProps) {
    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between">
                {STEPS.map((step, index) => (
                    <View key={step.id} className="flex-1 items-center">
                        {/* Step Circle */}
                        <View className="flex-row items-center w-full">
                            {/* Line before (except first) */}
                            {index > 0 && (
                                <View
                                    className="flex-1 h-0.5"
                                    style={{
                                        backgroundColor:
                                            currentStep > step.id ? palette.primary : palette.border,
                                    }}
                                />
                            )}

                            {/* Circle */}
                            <View
                                className="w-10 h-10 rounded-full items-center justify-center border-2"
                                style={{
                                    backgroundColor:
                                        currentStep >= step.id ? palette.primary : palette.surface,
                                    borderColor:
                                        currentStep >= step.id ? palette.primary : palette.border,
                                }}
                            >
                                {currentStep > step.id ? (
                                    <Feather name="check" size={20} color={palette.primaryOn} />
                                ) : (
                                    <Text
                                        className="text-base font-bold"
                                        style={{
                                            color:
                                                currentStep === step.id
                                                    ? palette.primaryOn
                                                    : palette.muted,
                                        }}
                                    >
                                        {step.id}
                                    </Text>
                                )}
                            </View>

                            {/* Line after (except last) */}
                            {index < STEPS.length - 1 && (
                                <View
                                    className="flex-1 h-0.5"
                                    style={{
                                        backgroundColor:
                                            currentStep > step.id ? palette.primary : palette.border,
                                    }}
                                />
                            )}
                        </View>

                        {/* Label */}
                        <Text
                            className="text-xs font-medium mt-2"
                            style={{
                                color: currentStep >= step.id ? palette.primary : palette.muted,
                            }}
                        >
                            {step.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
