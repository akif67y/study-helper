import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc,
    getDoc,
} from 'firebase/firestore';
import { db, appId } from '../firebase';

export const useDataCollection = (user, collectionName, parentField, parentId) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !parentId) {
            if (!parentId) setData([]);
            setLoading(false);
            return;
        }

        const colRef = collection(db, 'artifacts', appId, 'users', user.uid, collectionName);
        const q = query(colRef, where(parentField, '==', parentId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setData(items);
            setLoading(false);
        }, (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, collectionName, parentField, parentId]);

    return { data, loading };
};

export const useAllDocs = (user, collectionName) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const colRef = collection(db, 'artifacts', appId, 'users', user.uid, collectionName);

        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setData(items);
            setLoading(false);
        }, (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, collectionName]);

    return { data, loading };
};

export const useSingleDoc = (user, collectionName, docId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !docId) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collectionName, docId);
        getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                setData({ id: docSnap.id, ...docSnap.data() });
            }
            setLoading(false);
        }).catch((error) => {
            console.error(`Error fetching ${collectionName}/${docId}:`, error);
            setLoading(false);
        });
    }, [user, collectionName, docId]);

    return { data, loading };
};

export const addItem = async (user, collectionName, data) => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'users', user.uid, collectionName);
    return await addDoc(colRef, { ...data, userId: user.uid, timestamp: serverTimestamp() });
};

export const deleteItem = async (user, collectionName, itemId) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collectionName, itemId);
    await deleteDoc(docRef);
};
