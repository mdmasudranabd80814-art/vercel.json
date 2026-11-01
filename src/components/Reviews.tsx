import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, User } from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: Timestamp;
}

interface ReviewsProps {
  itemId: string;
  itemType: 'service' | 'product';
  initialName?: string;
}

export const Reviews: React.FC<ReviewsProps> = ({ 
  itemId, 
  itemType,
  initialName = ''
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState(initialName || auth.currentUser?.displayName || '');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('itemId', '==', itemId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
    }, (error) => {
      console.warn('Error fetching reviews:', error);
    });

    return () => unsubscribe();
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('দয়া করে একটি রেটিং দিন।');
      return;
    }
    if (!userName) {
      alert('দয়া করে আপনার নাম লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        itemId,
        itemType,
        rating,
        comment,
        userName,
        userEmail: auth.currentUser?.email || '',
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
      setComment('');
      setRating(0);
      setTimeout(() => {
        setIsSubmitted(false);
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('রিভিউ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary / Header */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <div>
          <h4 className="text-sm font-bold text-gray-900">কাস্টমার রিভিউ ({reviews.length})</h4>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => {
                const avg = reviews.length > 0 
                  ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
                  : 0;
                return (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 ${star <= Math.round(avg) ? 'fill-amber-500' : 'text-gray-300'}`} 
                  />
                );
              })}
            </div>
            {reviews.length > 0 && (
              <span className="text-xs font-bold text-gray-700">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
            )}
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            রিভিউ দিন
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-in slide-in-from-top-2 duration-300">
          {isSubmitted ? (
            <div className="flex flex-col items-center py-4 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <p className="text-sm font-bold text-gray-800">আপনার রিভিউ সফলভাবে জমা হয়েছে!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">আপনার অভিজ্ঞতা রেট করুন:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="p-1 transition-transform active:scale-110 cursor-pointer"
                    >
                      <Star 
                        className={`w-7 h-7 transition-colors ${
                          (hover || rating) >= star ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {!initialName && !auth.currentUser && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">আপনার নাম</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="আপনার নাম লিখুন"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-white"
                      required
                    />
                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">আপনার মন্তব্য (ঐচ্ছিক)</label>
                <div className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
                    rows={3}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-white"
                  />
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'প্রসেস হচ্ছে...' : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      রিভিউ পাঠান
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="border-b border-gray-50 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 uppercase">
                    {rev.userName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-gray-800">{rev.userName}</span>
                </div>
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-2.5 h-2.5 ${star <= rev.rating ? 'fill-amber-500' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
              </div>
              {rev.comment && (
                <p className="text-xs text-gray-600 leading-relaxed pl-8">
                  {rev.comment}
                </p>
              )}
              <div className="text-[10px] text-gray-400 mt-1 pl-8">
                {rev.createdAt?.toDate().toLocaleDateString('bn-BD')}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-gray-400">এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনি দিন!</p>
          </div>
        )}
      </div>
    </div>
  );
};
