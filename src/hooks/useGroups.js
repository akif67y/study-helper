import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db, appId } from '../firebase';

export const useUserGroups = (user) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const groupsRef = collection(db, 'artifacts', appId, 'groups');

        const unsubscribe = onSnapshot(groupsRef, (snapshot) => {
            const allGroups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Filter groups where user is a member
            const userGroups = allGroups.filter(group =>
                group.members?.some(m => m.userId === user.uid) || group.creatorId === user.uid
            );
            userGroups.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setGroups(userGroups);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching groups:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { groups, loading };
};

export const useGroupDetail = (groupId) => {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) {
            setLoading(false);
            return;
        }

        const groupRef = doc(db, 'artifacts', appId, 'groups', groupId);
        const unsubscribe = onSnapshot(groupRef, (docSnap) => {
            if (docSnap.exists()) {
                setGroup({ id: docSnap.id, ...docSnap.data() });
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching group:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [groupId]);

    return { group, loading };
};

export const useGroupSharedCourses = (groupId) => {
    const [sharedCourses, setSharedCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) {
            setLoading(false);
            return;
        }

        const coursesRef = collection(db, 'artifacts', appId, 'groupSharedCourses');
        const q = query(coursesRef, where('groupId', '==', groupId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            items.sort((a, b) => (b.sharedAt?.seconds || 0) - (a.sharedAt?.seconds || 0));
            setSharedCourses(items);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching shared courses:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [groupId]);

    return { sharedCourses, loading };
};

export const createGroup = async (name, members, creatorProfile) => {
    const groupsRef = collection(db, 'artifacts', appId, 'groups');
    const now = new Date();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let inviteCode = '';
    for (let i = 0; i < 6; i++) inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
    const groupDoc = await addDoc(groupsRef, {
        name: name.trim(),
        creatorId: creatorProfile.userId,
        creatorUsername: creatorProfile.username,
        inviteCode,
        members: members.map(m => ({
            userId: m.userId,
            username: m.username,
            email: m.email,
            joinedAt: now
        })),
        createdAt: serverTimestamp()
    });
    return groupDoc.id;
};

export const shareCourseToGroup = async (groupId, courseId, courseName, sharerProfile) => {
    const sharesRef = collection(db, 'artifacts', appId, 'groupSharedCourses');
    await addDoc(sharesRef, {
        groupId,
        courseId,
        courseName,
        sharedBy: sharerProfile.userId,
        sharedByUsername: sharerProfile.username,
        sharedAt: serverTimestamp()
    });
};

export const getSharedCourseProblems = async (userId, courseId) => {
    // Fetch all topics for this course
    const topicsRef = collection(db, 'artifacts', appId, 'users', userId, 'topics');
    const topicsQuery = query(topicsRef, where('course', '==', courseId));
    const topicsSnapshot = await getDocs(topicsQuery);

    const allProblems = [];

    // For each topic, fetch its questions
    for (const topicDoc of topicsSnapshot.docs) {
        const questionsRef = collection(db, 'artifacts', appId, 'users', userId, 'questions');
        const questionsQuery = query(questionsRef, where('topicId', '==', topicDoc.id));
        const questionsSnapshot = await getDocs(questionsQuery);

        for (const questionDoc of questionsSnapshot.docs) {
            const questionData = { id: questionDoc.id, ...questionDoc.data() };

            // Fetch solutions for this question
            const solutionsRef = collection(db, 'artifacts', appId, 'users', userId, 'solutions');
            const solutionsQuery = query(solutionsRef, where('questionId', '==', questionDoc.id));
            const solutionsSnapshot = await getDocs(solutionsQuery);

            const solutions = solutionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            allProblems.push({
                ...questionData,
                topicName: topicDoc.data().name,
                solutions
            });
        }
    }

    return allProblems;
};

export const addMemberToGroup = async (groupId, userProfile) => {
    const groupRef = doc(db, 'artifacts', appId, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const isMember = groupData.members?.some(m => m.userId === userProfile.userId);

        if (isMember) {
            throw new Error('User is already a member');
        }

        const updatedMembers = [
            ...(groupData.members || []),
            {
                userId: userProfile.userId,
                username: userProfile.username,
                email: userProfile.email,
                joinedAt: new Date()
            }
        ];

        await updateDoc(groupRef, { members: updatedMembers });
    } else {
        throw new Error('Group not found');
    }
};

export const joinGroupByCode = async (inviteCode, userProfile) => {
    const groupsRef = collection(db, 'artifacts', appId, 'groups');
    const q = query(groupsRef, where('inviteCode', '==', inviteCode.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw new Error('Invalid invite code');
    }

    const groupDoc = snapshot.docs[0];
    await addMemberToGroup(groupDoc.id, userProfile);
    return { id: groupDoc.id, ...groupDoc.data() };
};
