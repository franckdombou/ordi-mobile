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
import { db} from "../../firebaseConfig"
//import { useEffect, useState } from "react";


interface Product {
  id: string;
  nom: string;
  position: [number, number];
  statut: string;
}




const Page = () => {
  const items = useMemo(() => listingsData as any, []);
  const getoItems = useMemo(() => listingsDataGeo, []);
  const [category, setCategory] = useState<string>('Tiny homes');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
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
  }, []);  

  const onDataChanged = (category: string) => {
    setCategory(category);
  };

  return (
    <View style={{ flex: 1, marginTop: 80 }}>
      {/* Define pour custom header */}
      <Stack.Screen
        options={{
          header: () => <ExploreHeader onCategoryChanged={onDataChanged} />,
        }}
      />
      <ListingsMap listings={getoItems} />
      <ListingsBottomSheet listings={items} category={category} />
    </View>
  );
};

export default Page;
