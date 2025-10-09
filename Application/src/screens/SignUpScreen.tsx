import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { signUp, signIn } from "../services/authService"; // Make sure signIn exists

export default function SignUpScreen({ navigation }: any) {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [agreed, setAgreed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSignUp() {
    if (!fullName || !email || !password || !phoneNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (signInError) {
      Alert.alert("Login Failed", "Please try logging in manually.");
    } else {
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SignIn'),
        },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>नया खाता बनाएं</Text>
          <Text style={styles.subtitle}>Create a new account</Text>

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <FontAwesome name="user-o" size={20} color="#A9A9A9" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#A9A9A9"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome name="envelope-o" size={20} color="#A9A9A9" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#A9A9A9"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome name="phone" size={20} color="#A9A9A9" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#A9A9A9"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#A9A9A9" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <FontAwesome name={isPasswordVisible ? "eye-slash" : "eye"} size={20} color="#A9A9A9" />
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity onPress={() => setAgreed(!agreed)}>
                <FontAwesome
                  name={agreed ? "check-square" : "square-o"}
                  size={24}
                  color={agreed ? "#6B4EFF" : "#A9A9A9"}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.createAccountButton} onPress={handleSignUp} disabled={loading}>
              <Text style={styles.createAccountButtonText}>
                {loading ? "Creating..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  linkContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});
