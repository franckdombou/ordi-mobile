import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig'; // adapte si besoin
import { useAuth, useUser } from '@clerk/clerk-expo';

import { deleteDoc, doc } from 'firebase/firestore';
//import { db } from '@/lib/firebaseConfig'; // adapte au besoin


const { width } = Dimensions.get('window');

const mockTrips = [
  {
    id: '1',
    title: 'Appartement à Yaoundé',
    date: '2024-06-15',
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5"
  },
  {
    id: '2',
    title: 'Villa à Douala',
    date: '2024-07-01',
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5"
  },
];

const Page = () => {
  const [trips, setTrips] = useState<any[]>([]);
  //const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    // Remplacer par un appel API réel
    //setTrips(mockTrips);
    getOrdersByUserName()
  }, []);


 
  const { user } = useUser();
  const getOrdersByUserName = async () => {
    try {
      const ordersRef = collection(db, 'Orders2');
      const q = query(ordersRef, where('userName', '==', `${user?.firstName} ${user?.lastName}`));
  
      const querySnapshot = await getDocs(q);
  
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTrips(orders);
      console.log(orders)
  
      return orders;
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations :', error);
      return [];
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item?.listingImage }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.title}>{item.listingTitle}</Text>
        <Text style={styles.date}>Réservé le {item?.reservedAt}</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  const handleCancel = (id: any) => {
    Alert.alert('Annulation', 'Voulez-vous annuler cette réservation ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await deleteReservation(id); // Suppression Firestore
            setTrips((prev) => prev.filter((item: any) => item.id !== id)); // Mise à jour locale
          } catch (error) {
            console.error('Erreur lors de l’annulation de la réservation :', error);
          }
        },
      },
    ]);
  };
  
  const deleteReservation = async (id: string) => {
    const docRef = doc(db, 'Orders2', id);
    await deleteDoc(docRef);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mes Réservations</Text>
      {trips.length === 0 ? (
        <Text style={styles.empty}>Aucune réservation trouvée.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: width * 0.5,
  },
  details: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#e63946',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 16,
    color: '#aaa',
  },
});
export default Page 