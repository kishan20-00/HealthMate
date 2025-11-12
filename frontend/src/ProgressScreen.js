// screens/ProgressScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../config"; // Import Firebase services
import { doc, getDoc } from "firebase/firestore";

// --- Utility Functions for Time and Data ---

// Finds the latest record in an array history (assuming newest is at the end or by timestamp)
const getLatestRecord = (historyArray) => {
    if (!historyArray || historyArray.length === 0) return null;
    
    // Sort by timestamp (newest first) for reliability, as we use arrayUnion
    // Note: Must check if timestamp is a Firestore Timestamp object or a Date object
    const sorted = historyArray.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA;
    });
    return sorted[0];
};

const ProgressScreen = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    
    // --- State Declarations ---
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    
    // History arrays for visualization
    const [weightHistory, setWeightHistory] = useState([]);
    const [runHistory, setRunHistory] = useState([]);
    const [screenTimeHistory, setScreenTimeHistory] = useState([]);
    const [foodHistory, setFoodHistory] = useState([]);

    // --- Data Fetching Logic ---
    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (!user) {
                console.log("User not logged in.");
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    
                    // --- 1. Fetch Weight History (Existing Logic) ---
                    const wHistory = data.weightHistory || [];
                    const sortedWHistory = wHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
                    setWeightHistory(sortedWHistory);

                    // --- 2. Fetch Run History ---
                    const rHistory = data.runHistory || [];
                    setRunHistory(rHistory);

                    // --- 3. Fetch Screen Time History ---
                    const sHistory = data.screenTimeHistory || [];
                    setScreenTimeHistory(sHistory);

                    // --- 4. Fetch Food History ---
                    const fHistory = data.foodHistory || [];
                    setFoodHistory(fHistory);

                } else {
                    console.log("No user document found in Firestore.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // --- Calculation Functions ---
    const calculateWeightStats = (history) => {
        if (history.length < 2) {
            return { startWeight: null, currentWeight: history.length > 0 ? history[history.length - 1].weight : null, totalChange: 0, changeText: "N/A" };
        }
        
        const startWeight = history[0].weight;
        const currentWeight = history[history.length - 1].weight;
        const totalChange = (startWeight - currentWeight).toFixed(1);
        
        let changeText = "No net change.";
        let changeColor = theme.colors.text;

        if (totalChange > 0) {
            changeText = `${totalChange} kg lost! 🎉`;
            changeColor = theme.colors.success;
        } else if (totalChange < 0) {
            changeText = `${Math.abs(totalChange).toFixed(1)} kg gained.`;
            changeColor = theme.colors.primary; 
        }

        return { startWeight, currentWeight, totalChange, changeText, changeColor };
    };

    const calculateRunStats = (history) => {
        if (history.length === 0) return null;
        
        const totalDuration = history.reduce((sum, record) => sum + record.duration_minutes, 0);
        const totalCalories = history.reduce((sum, record) => sum + record.calories_burned, 0);
        const latestRecord = getLatestRecord(history);
        
        return {
            totalDuration: totalDuration.toFixed(0),
            totalCalories: totalCalories.toFixed(0),
            latestTime: latestRecord ? `${latestRecord.duration_minutes} min` : 'N/A',
            latestCals: latestRecord ? `${latestRecord.calories_burned} kcal` : 'N/A',
        };
    };

    const calculateScreenTimeStats = (history) => {
        if (history.length === 0) return null;

        // Calculate average screen time
        const totalScreenTime = history.reduce((sum, record) => sum + record.screen_time_hours, 0);
        const averageScreenTime = (totalScreenTime / history.length).toFixed(1);
        const latestRecord = getLatestRecord(history);
        
        return {
            averageScreenTime,
            latestTime: latestRecord ? `${latestRecord.screen_time_hours} hours` : 'N/A',
        };
    };

    const calculateFoodStats = (history) => {
        if (history.length === 0) return null;

        const latestRecord = getLatestRecord(history);
        const today = new Date().toISOString().split('T')[0];
        
        // Filter and sum calories for today
        const todayCalories = history
            .filter(record => record.date === today)
            .reduce((sum, record) => sum + record.calories, 0);

        return {
            todayCalories,
            latestMeal: latestRecord ? `${latestRecord.meal_name} (${latestRecord.calories} kcal)` : 'N/A',
        };
    };


    // --- Final Values from Calculations ---
    const { startWeight, currentWeight, changeText, changeColor } = 
        calculateWeightStats(weightHistory);

    const runStats = calculateRunStats(runHistory);
    const screenTimeStats = calculateScreenTimeStats(screenTimeHistory);
    const foodStats = calculateFoodStats(foodHistory);


    // --- Render Functions (Defined before use in JSX) ---

    const renderNoHistoryState = () => (
        <View style={styles.noHistorySection}>
            <Text style={styles.noHistoryEmoji}>📝</Text>
            <Text style={styles.noHistoryTitle}>Progress Not Recorded</Text>
            <Text style={styles.noHistoryText}>
                Start tracking your weight, runs, and meals to see personalized progress charts here.
            </Text>
            <TouchableOpacity style={styles.recordButton} onPress={() => console.log("Navigate to Data Entry Screen")}>
                <Text style={styles.recordButtonText}>Start Tracking Now</Text>
            </TouchableOpacity>
        </View>
    );

    const renderProgressVisualization = () => {
        // Renders the simplified Weight Visualization Chart
        
        if (weightHistory.length < 2) {
            return (
                <View style={styles.chartContainer}>
                    <Text style={styles.noDataText}>Add another entry to visualize the trend.</Text>
                </View>
            );
        }

        const minWeight = Math.min(...weightHistory.map(item => item.weight));
        const maxWeight = Math.max(...weightHistory.map(item => item.weight));
        const range = maxWeight - minWeight;

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Weight Trend Visualization</Text>
                <View style={styles.barChartWrapper}>
                    {weightHistory.map((entry, index) => {
                        const relativeWeight = (entry.weight - minWeight) / (range || 1);
                        const barHeight = 20 + relativeWeight * 50; 
                        const barColor = entry.weight === currentWeight ? theme.colors.primary : theme.colors.secondary;
                        
                        return (
                            <View key={index} style={styles.barWrapper}>
                                <View style={[styles.bar, { height: barHeight, backgroundColor: barColor }]} />
                            </View>
                        );
                    })}
                </View>
                <Text style={styles.chartFooter}>From {new Date(weightHistory[0].date).toLocaleDateString()} to {new Date(weightHistory[weightHistory.length - 1].date).toLocaleDateString()}</Text>
            </View>
        );
    };
    
    const renderTrackerCard = (title, emoji, stats, color) => {
        if (!stats) {
            return (
                <View style={[styles.trackerCard, { borderLeftColor: theme.colors.border }]}>
                    <Text style={styles.trackerTitle}>
                        <Text>{emoji} {title} Tracking</Text>
                    </Text>
                    <Text style={styles.trackerNoData}>No records yet. Start logging!</Text>
                </View>
            );
        }

        const metrics = [];
        
        // Ensure all text elements are properly wrapped in <Text>
        if (title === "Run") {
            metrics.push({ label: "Total Duration", value: stats.totalDuration, unit: "min", icon: "⏱️" });
            metrics.push({ label: "Total Calories", value: stats.totalCalories, unit: "kcal", icon: "🔥" });
            metrics.push({ label: "Last Run", value: stats.latestTime, unit: `(${stats.latestCals})`, icon: "➡️" });
        } else if (title === "Screen Time") {
            metrics.push({ label: "Average Time", value: stats.averageScreenTime, unit: "hours", icon: "⏱️" });
            metrics.push({ label: "Last Recorded", value: stats.latestTime, unit: "", icon: "➡️" });
        } else if (title === "Food") {
            metrics.push({ label: "Today's Calories", value: stats.todayCalories.toLocaleString(), unit: "kcal", icon: "📊" });
            metrics.push({ label: "Last Meal", value: stats.latestMeal, unit: "", icon: "🍽️" });
        }
        
        return (
            <View style={[styles.trackerCard, { borderLeftColor: color }]}>
                <Text style={styles.trackerTitle}>
                    <Text>{emoji} {title} Summary</Text>
                </Text>
                <View style={styles.trackerMetrics}>
                    {metrics.map((metric, index) => (
                        <View key={index} style={styles.trackerMetricItem}>
                            <Text style={styles.trackerMetricLabel}><Text>{metric.icon} {metric.label}</Text></Text>
                            <Text style={styles.trackerMetricValue}>
                                {metric.value} 
                                <Text style={styles.trackerMetricUnit}> {metric.unit}</Text>
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };


    // --- Component Rendering ---
    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading Progress...</Text>
            </View>
        );
    }
    
    // Check if any history exists at all
    const hasAnyHistory = weightHistory.length > 0 || runHistory.length > 0 || screenTimeHistory.length > 0 || foodHistory.length > 0;
    
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>📈 Health Progress</Text>
                <Text style={styles.subtitle}>Track your milestones and achievements</Text>
            </View>

            {/* Render 'No History' state if nothing is tracked */}
            {!hasAnyHistory && renderNoHistoryState()}

            {/* --- 1. Weight Progress (Existing) --- */}
            {weightHistory.length > 0 && (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎯 Your Weight Progress</Text>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Total Change</Text>
                            <Text style={[styles.changeText, { color: changeColor }]}>{changeText}</Text>
                            
                            <View style={styles.weightMetrics}>
                                <View style={styles.metricItem}>
                                    <Text style={styles.metricLabel}>Start Weight</Text>
                                    <Text style={styles.metricValue}>{startWeight ? `${startWeight} kg` : 'N/A'}</Text>
                                </View>
                                <View style={styles.metricSeparator} />
                                <View style={styles.metricItem}>
                                    <Text style={styles.metricLabel}>Current Weight</Text>
                                    <Text style={[styles.metricValue, { color: theme.colors.primary }]}>{currentWeight ? `${currentWeight} kg` : 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📊 Weight History Chart</Text>
                        {renderProgressVisualization()}
                    </View>
                </>
            )}
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏃 Daily Activity Trackers</Text>
                
                {/* --- 2. Run Tracker Summary --- */}
                {renderTrackerCard("Run", "🏃", runStats, theme.colors.secondary)}

                {/* --- 3. Screen Time Tracker Summary --- */}
                {renderTrackerCard("Screen Time", "💻", screenTimeStats, theme.colors.purple)}

                {/* --- 4. Food/Meal Tracker Summary --- */}
                {renderTrackerCard("Food", "🥗", foodStats, theme.colors.success)}

            </View>

        </ScrollView>
    );
};

// Function to create themed styles
const createStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        loadingContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: theme.spacing.xl * 2,
        },
        loadingText: {
            marginTop: theme.spacing.md,
            color: theme.colors.text,
        },
        header: {
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.xl,
            alignItems: "center",
            borderBottomLeftRadius: theme.borderRadius.large,
            borderBottomRightRadius: theme.borderRadius.large,
        },
        title: {
            fontSize: theme.typography.sizes.title,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        subtitle: {
            fontSize: theme.typography.sizes.md,
            color: theme.colors.textLight,
        },
        section: {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
        },
        sectionTitle: {
            fontSize: theme.typography.sizes.xl,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
        },
        
        // --- Tracker Card Styles ---
        trackerCard: {
            backgroundColor: theme.colors.card,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.medium,
            ...theme.shadows.small,
            borderLeftWidth: 4,
            marginBottom: theme.spacing.md,
        },
        trackerTitle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
        },
        trackerNoData: {
            fontSize: theme.typography.sizes.md,
            color: theme.colors.textLight,
            fontStyle: 'italic',
        },
        trackerMetrics: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        trackerMetricItem: {
            width: '48%',
            marginBottom: theme.spacing.sm,
        },
        trackerMetricLabel: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textLight,
            marginBottom: 2,
        },
        trackerMetricValue: {
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text,
        },
        trackerMetricUnit: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.textLight,
        },

        // --- Existing Weight Styles (Retained) ---
        noHistorySection: {
            padding: theme.spacing.xl,
            margin: theme.spacing.lg,
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.medium,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.shadows.medium,
        },
        noHistoryEmoji: { fontSize: 48, marginBottom: theme.spacing.md, },
        noHistoryTitle: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold, color: theme.colors.text, marginBottom: theme.spacing.sm, textAlign: 'center', },
        noHistoryText: { fontSize: theme.typography.sizes.md, color: theme.colors.textLight, textAlign: 'center', lineHeight: 22, marginBottom: theme.spacing.xl, },
        recordButton: { backgroundColor: theme.colors.secondary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.large, },
        recordButtonText: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.text, },
        summaryCard: { backgroundColor: theme.colors.card, padding: theme.spacing.lg, borderRadius: theme.borderRadius.medium, ...theme.shadows.medium, alignItems: 'center', },
        summaryTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, color: theme.colors.text, marginBottom: theme.spacing.sm, },
        changeText: { fontSize: theme.typography.sizes.title, fontWeight: theme.typography.weights.bold, marginBottom: theme.spacing.lg, },
        weightMetrics: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border, },
        metricItem: { alignItems: 'center', flex: 1, },
        metricLabel: { fontSize: theme.typography.sizes.sm, color: theme.colors.textLight, marginBottom: 5, },
        metricValue: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.text, },
        metricSeparator: { width: 1, backgroundColor: theme.colors.border, height: '80%', alignSelf: 'center', marginHorizontal: theme.spacing.md, },
        chartContainer: { backgroundColor: theme.colors.card, padding: theme.spacing.lg, borderRadius: theme.borderRadius.medium, ...theme.shadows.small, minHeight: 150, position: 'relative', },
        chartTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.medium, color: theme.colors.textLight, marginBottom: theme.spacing.md, },
        barChartWrapper: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100, paddingHorizontal: theme.spacing.sm, },
        barWrapper: { alignItems: 'center', marginHorizontal: 2, },
        bar: { width: 15, borderRadius: 3, },
        chartFooter: { textAlign: 'center', marginTop: theme.spacing.md, fontSize: theme.typography.sizes.sm, color: theme.colors.textLight, },
        noDataText: { fontSize: theme.typography.sizes.md, fontStyle: 'italic', color: theme.colors.textLight, textAlign: 'center', paddingVertical: theme.spacing.lg, }
    });

export default ProgressScreen;