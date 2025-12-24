import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db, appId } from '../firebase';

export const useSharedProblems = (user) => {
    const [sharedProblems, setSharedProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const sharesRef = collection(db, 'artifacts', appId, 'sharedProblems');
        const q = query(sharesRef, where('recipientId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setSharedProblems(items);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching shared problems:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { sharedProblems, loading };
};

export const useUnreadShareCount = (user) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setCount(0);
            return;
        }

        const sharesRef = collection(db, 'artifacts', appId, 'sharedProblems');
        const q = query(sharesRef, where('recipientId', '==', user.uid), where('status', '==', 'pending'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCount(snapshot.docs.length);
        });

        return () => unsubscribe();
    }, [user]);

    return count;
};

export const createShare = async (questionId, recipientId, recipientUsername, questionData, solutions, senderProfile, courseContext, topicContext) => {
    const sharesRef = collection(db, 'artifacts', appId, 'sharedProblems');
    await addDoc(sharesRef, {
        questionId,
        questionData: {
            title: questionData.title,
            problemText: questionData.problemText
        },
        solutions: solutions.map(sol => ({
            content: sol.content,
            type: sol.type,
            timestamp: sol.timestamp
        })),
        senderId: senderProfile.userId,
        senderEmail: senderProfile.email,
        senderUsername: senderProfile.username,
        recipientId,
        recipientUsername,
        courseContext,
        topicContext,
        status: 'pending',
        timestamp: serverTimestamp()
    });
};

export const markShareAsViewed = async (shareId) => {
    const shareRef = doc(db, 'artifacts', appId, 'sharedProblems', shareId);
    await updateDoc(shareRef, { status: 'viewed' });
};
