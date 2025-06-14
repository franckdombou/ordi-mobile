import { View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import ListingsBottomSheet from '@/components/ListingsBottomSheet';
import listingsData from '@/assets/data/airbnb-listings.json';
import ListingsMap from '@/components/ListingsMap';
import listingsDataGeo from '@/assets/data/airbnb-listings.geo.json';
import { Stack } from 'expo-router';
import ExploreHeader from '@/components/ExploreHeader';
import { doc, getDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
//import { db } from './firebase'; // ton fichier firebase config
//import { db} from "../../firebaseConfig"
//import { useEffect, useState } from "react";
import { db } from '@/lib/firebaseConfig'; // adapte le chemin
import { useLocalSearchParams } from 'expo-router';

interface Product2 {
  id: string;
  nom: string;
  position: [number, number];
  statut: string;
}

type Product = {
  id: string;
  name: string;
  price: number;
  // ajoute ici d'autres propriétés si besoin
};



const Page = () => {
  const items = useMemo(() => listingsData as any, []);
  
  const getoItems = useMemo(() => listingsDataGeo, []);
  const [category, setCategory] = useState<string>('Appartements');
  const [products, setProducts] =  useState<any[]>([]);
  const [listingsGeo, setListingsGeo] = useState<any>({
    type: "FeatureCollection",
    features: [],
  });

  const searchParams = useLocalSearchParams();
const query = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';

  /*useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList: Product[] = querySnapshot.docs.map((doc, index) => {
          const data = doc.data() as {
            Titre?: string;
            Latitude: string;
            Longitude: string;
            Statut?: string;
          }; 

          return {
            id: doc.id,
            nom: data.Titre || `Maison ${index + 1}`,
            position: [parseFloat(data.Latitude), parseFloat(data.Longitude)],
            statut: data.Statut || "Fin",
          };
        });

        setProducts(productsList);
        console.log("Maisons formatées :", productsList);
      } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
      }
    };

    fetchProducts();
  }, []);  */

  const onDataChanged = (category: string) => {
    setCategory(category);
  };

  /////////////////////////// FILTRE///////////////////////
 // useEffect(() => {
  //  fetchProducts();
  //}, []);

  const handleShowMap = () => {
    fetchProducts(); // recharge les données depuis Firestore
  };
  
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });
  
    let filtered = transformToListing(productList); 
  
    if (query) {
      filtered = filtered.filter((item:any) =>
      //  item.Titre?.toLowerCase().includes(query) ||
      item.smart_location?.toLowerCase().includes(query) 
     // item.Secteur?.toLowerCase().includes(query) ||
      //item.Standing_du_loyer?.toLowerCase().includes(query) ||
      //  item.smart_location?.toLowerCase().includes(query)
      );
   
    }
    console.log(filtered)


    // ✅ Appliquer le filtre par catégorie ici
  if (false) {
    filtered = filtered.filter((item: any) =>
      item.room_type?.toLowerCase() == category.toLowerCase()
    );
  }
    console.log("category")
    console.log(category)
    console.log(filtered)
  
    setProducts(filtered);
    setListingsGeo(toGeoJSON(filtered));
  };

  function toGeoJSON(listings: any[]) {
    return {
      type: "FeatureCollection",
      features: listings.map((item) => ({
        type: "Feature",
        properties: {
          id: item.id,
          name: item.name,
          price: item.price,
          latitude: parseFloat(item.geolocation.lat),
          longitude: parseFloat(item.geolocation.lon),
          statut: item.statut || "Libre", // par défaut
        },
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(item.geolocation.lon),
            parseFloat(item.geolocation.lat),
          ],
        },
      })),
    };
  }
  
  

  ////////////////////////////////////////////
  

  const fetchProducts2 = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productList: Product[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Product, 'id'>;
      return {
        id: doc.id,
        ...data,
      };
    });

    let filtered = transformToListing(productList);

    // ✅ Appliquer le filtre par catégorie ici
  if (category) {
    filtered = filtered.filter((item: any) =>
      item.room_type?.toLowerCase() === category.toLowerCase()
    );
  }

  
  setProducts(filtered);
  setListingsGeo(toGeoJSON(filtered));
    
    console.log(transformToListing(productList))
    console.log("products")
    console.log(productList)
  //  setProducts(transformToListing(productList));
    
  };

  useEffect(() => {
    fetchProducts();
  }, [category]); // <- Ajout de category ici

  function transformToListing(dataArray: any[]) {
    return dataArray.map((item: any) => {
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
        description: item.Description || "Pas de description",
        xl_picture_url: item.img || "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5",
        medium_url: item.img || "https://firebasestorage.googleapis.com/v0/b/sparkdb-22741.appspot.com/o/1748982271224_xd1.jpg?alt=media&token=5a3e46f2-b916-4707-a16d-0660b64c9de5",
        listing_url: listingUrl,
        host_name: item.Numero_Agent_Immobilier || "Agent inconnu",
        host_picture_url: item.img2 || "",  // image de l'agent
        host_since: "2020",  // Valeur statique ou à adapter si tu as la data
        review_scores_rating: 80,  // Valeur par défaut ou à adapter
        number_of_reviews: 10,  // Valeur par défaut ou à adapter
        geolocation: {
          lon: item.Longitude || 11.1500,
          lat: item.Latitude || 2.9000
    },
      };
    });
  }

  return (
    <View style={{ flex: 1, marginTop: 1 }}>
      {/* Define pour custom header */}
      <Stack.Screen
       // options={{
        //  header: () => <ExploreHeader onCategoryChanged={onDataChanged} />,
       // }}
      />
      <ListingsMap listings={getoItems} listingNews={listingsGeo} />
      <ListingsBottomSheet listings={products} category={category} onShowMap={handleShowMap} />
    </View>
  );
};


const tab = [
  {
    "id": "1",
    "listing_url": "https://www.example.com/location/appartement-paris-1",
    "scrape_id": "20250602100001",
    "last_scraped": "2025-06-02",
    "name": "Superbe Appartement Haussmannien - Coeur de Paris",
    "summary": "Appartement de 3 pièces entièrement rénové dans un immeuble haussmannien, situé au cœur de Paris. Idéal pour un couple ou une petite famille. Proche de toutes commodités et transports en commun.",
    "space": "Ce charmant appartement de 75m² comprend un grand salon lumineux avec cheminée, deux chambres spacieuses, une cuisine équipée moderne et une salle de bain avec douche à l'italienne. Parquet ancien et moulures d'origine. Vue sur un jardin intérieur calme. Très lumineux.",
    "description": "Découvrez le charme parisien dans cet appartement haussmannien exceptionnel. Situé dans le 1er arrondissement, à quelques pas du Louvre et du Jardin des Tuileries, il offre un cadre de vie prestigieux. Le salon, baigné de lumière naturelle, est parfait pour se détendre après une journée de découverte. Les deux chambres sont confortables et offrent un espace de repos paisible. La cuisine est entièrement équipée avec four, micro-ondes, lave-vaisselle et réfrigérateur. La salle de bain est moderne et fonctionnelle. L'appartement est équipé du Wi-Fi et de la télévision. Le quartier est réputé pour ses boutiques de luxe, ses restaurants gastronomiques et ses attractions culturelles. Accès facile aux lignes de métro 1, 7, 14. Une expérience parisienne authentique vous attend.",
    "experiences_offered": "none",
    "neighborhood_overview": "Le 1er arrondissement est le quartier historique et culturel de Paris, abritant des monuments emblématiques comme le Palais Royal, le Louvre et la Place Vendôme. C'est un quartier dynamique avec une multitude de boutiques, de cafés et de restaurants. Il est très bien desservi par les transports en commun, ce qui facilite l'accès à toutes les attractions parisiennes.",
    "notes": "Appartement non-fumeur. Les animaux ne sont pas admis. Idéal pour des séjours de moyenne ou longue durée.",
    "transit": "Métro : Lignes 1 (Palais Royal - Musée du Louvre), 7 (Palais Royal - Musée du Louvre), 14 (Pyramides). Nombreuses lignes de bus à proximité.",
    "access": "Accès à toutes les pièces de l'appartement. Lave-linge et sèche-linge disponibles. Linge de lit et de toilette fournis.",
    "interaction": "Le propriétaire est disponible pour toute question et pourra vous donner des conseils sur les activités et restaurants locaux.",
    "house_rules": "Respecter le voisinage, pas de fêtes. Fumer est strictement interdit à l'intérieur. Éteindre les lumières et le chauffage en quittant l'appartement.",
    "thumbnail_url": "https://www.example.com/images/appart_paris1_thumb.jpg",
    "medium_url": "https://www.example.com/images/appart_paris1_medium.jpg",
    "picture_url": {
      "thumbnail": true,
      "filename": "appart_paris1.jpg",
      "format": "JPEG",
      "width": 720,
      "mimetype": "image/jpeg",
      "etag": "\"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6\"",
      "id": "img12345",
      "last_synchronized": "2025-06-01T15:00:00.000000",
      "color_summary": [
        "rgba(200, 180, 160, 1.00)",
        "rgba(150, 130, 110, 1.00)",
        "rgba(230, 220, 210, 1.00)"
      ],
      "height": 480
    },
    "xl_picture_url": "https://www.example.com/images/appart_paris1_xl.jpg",
    "host_id": "987654321",
    "host_url": "https://www.example.com/users/host_paris1",
    "host_name": "Sophie Dupont",
    "host_since": "2020-01-15",
    "host_location": "Paris, Île-de-France, France",
    "host_about": "Passionnée par ma ville, je suis ravie de partager mon appartement avec des voyageurs du monde entier. J'aime le cinéma et la cuisine.",
    "host_response_time": "within an hour",
    "host_response_rate": 98,
    "host_acceptance_rate": null,
    "host_thumbnail_url": "https://www.example.com/images/host_sophie_thumb.jpg",
    "host_picture_url": "https://www.example.com/images/host_sophie_medium.jpg",
    "host_neighbourhood": "Louvre - Tuileries",
    "host_listings_count": 2,
    "host_total_listings_count": 2,
    "host_verifications": ["email", "phone", "reviews"],
    "street": "Rue de Rivoli, 75001 Paris, France",
    "neighbourhood": "Louvre - Tuileries",
    "neighbourhood_cleansed": "Saint-Germain-l'Auxerrois",
    "neighbourhood_group_cleansed": "Paris",
    "city": "Paris",
    "state": "Île-de-France",
    "zipcode": "75001",
    "market": "Paris",
    "smart_location": "Paris, France",
    "country_code": "FR",
    "country": "France",
    "latitude": "48.8617",
    "longitude": "2.3364",
    "property_type": "Appartement",
    "room_type": "Entire home/apt",
    "accommodates": 4,
    "bathrooms": 1.0,
    "bedrooms": 2,
    "beds": 2,
    "bed_type": "Real Bed",
    "amenities": [
      "TV",
      "Wifi",
      "Cuisine",
      "Lave-linge",
      "Sèche-linge",
      "Chauffage",
      "Détecteur de fumée",
      "Extincteur",
      "Essentiels",
      "Shampoing",
      "Cintres",
      "Sèche-cheveux",
      "Fer à repasser"
    ],
    "square_feet": 750,
    "price": 1200,
    "weekly_price": 1500,
    "monthly_price": 5500,
    "security_deposit": 500,
    "cleaning_fee": 80,
    "guests_included": 2,
    "extra_people": 20,
    "minimum_nights": 3,
    "maximum_nights": 365,
    "calendar_updated": "today",
    "has_availability": true,
    "availability_30": 20,
    "availability_60": 45,
    "availability_90": 70,
    "availability_365": 200,
    "calendar_last_scraped": "2025-06-02",
    "number_of_reviews": 45,
    "first_review": "2021-03-10",
    "last_review": "2025-05-20",
    "review_scores_rating": 95,
    "review_scores_accuracy": 10,
    "review_scores_cleanliness": 9,
    "review_scores_checkin": 10,
    "review_scores_communication": 10,
    "review_scores_location": 10,
    "review_scores_value": 9,
    "license": null,
    "jurisdiction_names": null,
    "cancellation_policy": "strict_14_with_grace_period",
    "calculated_host_listings_count": 2,
    "reviews_per_month": 1.5,
    "geolocation": {
      "lon": 2.3364,
      "lat": 48.8617
    },
    "features": [
      "Host Has Profile Pic",
      "Host Identity Verified",
      "Is Location Exact"
    ]
  },]

export default Page;
