import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Share } from 'react-native';
import listingsData from '@/assets/data/airbnb-listings.json';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Animated, {
  SlideInDown,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { defaultStyles } from '@/constants/Styles';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig'; // adapte le chemin
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
//import { db } from '@/lib/firebaseConfig'; // adapte ce chemin à ton projet
import { Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { getDocs, query, where } from 'firebase/firestore';



const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

const DetailsPage = () => {
  //const { id } = useLocalSearchParams();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  //const listing = (listingsData as any[]).find((item) => item.id === id);
  const navigation = useNavigation();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [item, setItem] = useState<any>({});
  const [listing, setListing] = useState<any>({});
  const [idUser, setIdUser] = useState("");


  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing(transformToListing({ id: docSnap.id, ...docSnap.data() }))
          setItem({ id: docSnap.id, ...docSnap.data() });
        }
      };
      fetchItem();
    }
  }, [id]);

  function transformToListing(item: any) {
    const pricePerMonth = parseFloat(item.Prix_par_mois) || 0;
    const pricePerNight = pricePerMonth > 0 ? (pricePerMonth / 30).toFixed(2) : "N/A";

    // Construire une URL de listing simple (exemple fictif)
    const listingUrl = `https://myapp.example.com/listings/${item.id}`;

    return {
      id: item.id,
      name: item.Titre || "Nom non disponible",
      smart_location: [item.Quartier, item.Secteur, item.Nom_de_la_cite]
        .filter(Boolean)
        .join(', '),
      room_type: item.Categorie || "Type inconnu",
      bedrooms: parseInt(item.Nombre_de_chambres, 10) || 0,
      bathrooms: parseInt(item.Nombre_de_salles_de_bain, 10) || 0,
      guests_included: parseInt(item.Nombre_de_chambres, 10) || 1,  // Exemple: 1 par chambre
      price: pricePerMonth,
      pricePerNight,  // tu peux ajouter ce champ si besoin
      description: item.Description || "Pas de description",
      xl_picture_url: item.img || "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5",
      xl_picture_url2: item.img2 || "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5",
      xl_picture_url3: item.img3 || "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5",
      xl_picture_url4: item.img4 || "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5",
      medium_url: item.img || "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5",
      listing_url: listingUrl,
      host_name: item.Numero_Agent_Immobilier || "Agent inconnu",
      host_picture_url: item.img2 || "",  // image de l'agent
      host_since: "2020",  // Valeur statique ou à adapter si tu as la data
      review_scores_rating: 80,  // Valeur par défaut ou à adapter
      number_of_reviews: 10,  // Valeur par défaut ou à adapter
      geolocation: {
        lon: item.Longitude || 11.1500,
        lat: item.Latitude || 2.9000,
      },
    };
  }


  const shareListing = async () => {
    try {
      await Share.share({
        title: listing.name,
        url: listing.listing_url,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerTransparent: true,

      headerBackground: () => (
        <Animated.View style={[headerAnimatedStyle, styles.header]}></Animated.View>
      ),
      headerRight: () => (
        <View style={styles.bar}>
          <TouchableOpacity style={styles.roundButton} onPress={shareListing}>
            <Ionicons name="share-outline" size={22} color={'#000'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundButton}>
            <Ionicons name="heart-outline" size={22} color={'#000'} />
          </TouchableOpacity>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity style={styles.roundButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={'#000'} />
        </TouchableOpacity>
      ),
    });
  }, []);

  const scrollOffset = useScrollViewOffset(scrollRef);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollOffset.value, [0, IMG_HEIGHT / 1.5], [0, 1]),
    };
  }, []);
  //{/*<GestureHandlerRootView style={{ flex: 1 }}>*/}

  const { user } = useUser();

  const reserveListing = async (listing: any) => {
    try {


      const ordersRef = collection(db, 'Users');

      const q = query(ordersRef, where('nom', '==', `${user?.firstName} ${user?.lastName}`));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Retourne le premier document trouvé (ou adapte si plusieurs résultats possibles)
        const doc = querySnapshot.docs[0];
        setIdUser(doc.id);
        console.log('User ID:', doc.id);


        if (!user) {
          Alert.alert("Erreur", "Vous devez être connecté pour réserver.");
          return;
        }

        const order = {
          userId: idUser,
          userName: `${user?.firstName} ${user?.lastName}` || '',
          phoneNumber: user.primaryEmailAddress?.emailAddress || '+237698219893',
          listingId: listing.id,
          listingTitle: listing.name,
          listingLocation: listing.smart_location,
          listingImage: listing.xl_picture_url,
          price: listing.price,
          reservedAt: new Date().toLocaleDateString('fr-FR'),
          idProduct: id,
          CustomerName: `${user?.firstName} ${user?.lastName}` || '',
          DateDebut: new Date().toLocaleDateString('fr-FR'),
          DateFin: new Date().toLocaleDateString('fr-FR'),
          Montant: listing.price,
          PaiementMode: "CASH",
          Statut: "Reservé"
        };

        await addDoc(collection(db, 'orders'), order);

        Alert.alert('Réservation confirmée', 'Votre réservation a bien été enregistrée.');
      }
    } catch (error) {
      console.error('Erreur de réservation :', error);
      Alert.alert('Erreur', 'Impossible de réserver la maison.');
    }
  }







  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          ref={scrollRef}
          scrollEventThrottle={16}>
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ height: IMG_HEIGHT }}
          >
            {[listing?.xl_picture_url, listing?.xl_picture_url2, listing?.xl_picture_url3, listing?.xl_picture_url4].map((uri, index) => (
              <Animated.Image
                key={index}
                source={{ uri: uri || "https://default-image-url" }}
                style={[styles.image, imageAnimatedStyle]}
                resizeMode="cover"
              />
            ))}
          </Animated.ScrollView>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>{listing.name}</Text>
            <Text style={styles.location}>
              {listing.room_type} a {listing.smart_location}
            </Text>
            <Text style={styles.rooms}>
              {listing.guests_included} salon · {listing.bedrooms} Chambres ·{' '}
              {listing.bathrooms} Douches
            </Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Ionicons name="star" size={16} />
              <Text style={styles.ratings}>
                {listing.review_scores_rating / 20} · {listing.number_of_reviews} notes
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.hostView}>
              <Image source={{ uri: listing.host_picture_url }} style={styles.host} />

              <View>
                <Text style={{ fontWeight: '500', fontSize: 16 }}>La ville D'Ebolowa</Text>
                <Text>Construite depuis 01-01-2024</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.description}>{listing.description}</Text>
          </View>
        </Animated.ScrollView>

        <Animated.View style={defaultStyles.footer} entering={SlideInDown.delay(200)}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity style={styles.footerText}>
              <Text style={styles.footerPrice}>{listing.price} fcfa</Text>
              <Text>mois</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => reserveListing(listing)} style={[defaultStyles.btn, { paddingRight: 20, paddingLeft: 20 }]}>
              <Text style={defaultStyles.btnText}>Reserve</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    height: IMG_HEIGHT,
    width: Dimensions.get('window').width,
  },
  infoContainer: {
    padding: 24,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'mon-sb',
  },
  location: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: 'mon-sb',
  },
  rooms: {
    fontSize: 16,
    color: Colors.grey,
    marginVertical: 4,
    fontFamily: 'mon',
  },
  ratings: {
    fontSize: 16,
    fontFamily: 'mon-sb',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.grey,
    marginVertical: 16,
  },
  host: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: Colors.grey,
  },
  hostView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    height: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerPrice: {
    fontSize: 18,
    fontFamily: 'mon-sb',
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.primary,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  header: {
    backgroundColor: '#fff',
    height: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.grey,
  },

  description: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'mon',
  },
});

export default DetailsPage;
 //