import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { defaultStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Link } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
//import { collection, addDoc } from 'firebase/firestore';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';import { db } from '@/lib/firebaseConfig'; // adapte le chemin




const Page = () => {
  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName);
  const [lastName, setLastName] = useState(user?.lastName);
  const [email, setEmail] = useState(user?.emailAddresses[0].emailAddress);
  const [edit, setEdit] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.emailAddresses[0].emailAddress);
    addUserToFirestore(user);
  }, [user]);

  // Update Clerk user data
  const onSaveUser = async () => {
    try {
      await user?.update({
        firstName: firstName!,
        lastName: lastName!,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setEdit(false);
    }
  };

  // Capture image from camera roll
  // Upload to Clerk as avatar
  const onCaptureImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = `data:image/png;base64,${result.assets[0].base64}`;
      user?.setProfileImage({
        file: base64,
      });
    }
  };


  const addUserToFirestore = async(user: any)=> {
    if (!user?.firstName || !user?.lastName || !user?.emailAddresses?.[0]?.emailAddress) {
      throw new Error('Données utilisateur incomplètes');
    }
  
    const email = user.emailAddresses[0].emailAddress;
    const usersRef = collection(db, 'Users');
  
    try {
      // Vérifier si l'utilisateur existe déjà
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const existingUser = querySnapshot.docs[0];
        console.log('Utilisateur déjà existant avec ID :', existingUser.id);
        return existingUser.id;
      }
  
      // Ajouter l'utilisateur s'il n'existe pas
      const docRef = await addDoc(usersRef, {
        nom: `${user.firstName} ${user.lastName}`, // Utilisation des template literals pour une meilleure lisibilité
        email: email, // Explicite, ou simplement 'email,' si c'est un raccourci d'objet
        createdAt: new Date(),
    
        // Pour les valeurs par défaut avec l'opérateur OR (||), la valeur par défaut est celle si la première est "falsy" (null, undefined, '', 0, false).
        // Si la source (user.phoneNumber, user.city, etc.) peut être null ou undefined, c'est utile.
        // Sinon, si la valeur vient directement de la source, mettez-la directement.
        telephone: user.phoneNumber || "+237********", // Préférez la donnée réelle si elle existe, sinon la valeur par défaut
        dateNaissance: user.birthDate || new Date(), // Mieux de vérifier si user.birthDate est valide avant de créer une nouvelle date
        ville: user.city || "Ebolowa", // Préférez la donnée réelle si elle existe, sinon la valeur par défaut
        genre: user.gender || "M/F", // Préférez la donnée réelle si elle existe, sinon la valeur par défaut
        statut: user.status || "Ras", // Préférez la donnée réelle si elle existe, sinon la valeur par défaut
        metier: user.job || "RAS" // Préférez la donnée réelle si elle existe, sinon la valeur par défaut
    });
      console.log('Nouvel utilisateur ajouté avec ID :', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors du traitement de l’utilisateur :', error);
      throw error;
    }
  }

  return (
    <SafeAreaView style={defaultStyles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Profile</Text>
        <Ionicons name="notifications-outline" size={26} />
      </View>

      {user && (
        <View style={styles.card}>
          <TouchableOpacity onPress={onCaptureImage}>
            <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {!edit && (
              <View style={styles.editRow}>
                <Text style={{ fontFamily: 'mon-b', fontSize: 22 }}>
                  {firstName} {lastName}
                </Text>
                <TouchableOpacity onPress={() => setEdit(true)}>
                  <Ionicons name="create-outline" size={24} color={Colors.dark} />
                </TouchableOpacity>
              </View>
            )}
            {edit && (
              <View style={styles.editRow}>
                <TextInput
                  placeholder="First Name"
                  value={firstName || ''}
                  onChangeText={setFirstName}
                  style={[defaultStyles.inputField, { width: 100 }]}
                />
                <TextInput
                  placeholder="Last Name"
                  value={lastName || ''}
                  onChangeText={setLastName}
                  style={[defaultStyles.inputField, { width: 100 }]}
                />
                <TouchableOpacity onPress={onSaveUser}>
                  <Ionicons name="checkmark-outline" size={24} color={Colors.dark} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Text>{email}</Text>
          <Text>Since {user?.createdAt!.toLocaleDateString()}</Text>
        </View>
      )}

      {isSignedIn && <Button title="Log Out" onPress={() => signOut()} color={Colors.dark} />}
      {!isSignedIn && (
        <Link href={'/(modals)/login'} asChild>
          <Button title="Log In" color={Colors.dark} />
        </Link>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    fontFamily: 'mon-b',
    fontSize: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.grey,
  },
  editRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default Page;


  