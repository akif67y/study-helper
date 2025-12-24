import { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db, appId } from '../firebase';

export const useUserProfile = (user) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const profileRef = doc(db, 'artifacts', appId, 'userProfiles', user.uid);
        getDoc(profileRef).then((docSnap) => {
            if (docSnap.exists()) {
                setProfile({ id: docSnap.id, ...docSnap.data() });
            }
            setLoading(false);
        }).catch((error) => {
            console.error('Error fetching user profile:', error);
            setLoading(false);
        });
    }, [user]);

    return { profile, loading };
};

export const createUserProfile = async (user, username) => {
    if (!user || !username) return;
    const profileRef = doc(db, 'artifacts', appId, 'userProfiles', user.uid);
    await setDoc(profileRef, {
        userId: user.uid,
        email: user.email,
        username: username.trim(),
        timestamp: serverTimestamp()
    });
};

export const useUserSearch = (searchQuery) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        const profilesRef = collection(db, 'artifacts', appId, 'userProfiles');

        getDocs(profilesRef).then((snapshot) => {
            const allProfiles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const search = searchQuery.toLowerCase().trim();

            const filtered = allProfiles.filter(profile =>
                profile.username?.toLowerCase().includes(search) ||
                profile.email?.toLowerCase().includes(search)
            );

            setResults(filtered);
            setLoading(false);
        }).catch((error) => {
            console.error('Error searching users:', error);
            setLoading(false);
        });
    }, [searchQuery]);

    return { results, loading };
};
