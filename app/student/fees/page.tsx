"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/student/StudentLayout";

interface Fee {
  totalFee: number;
  discountPercent: number;
  finalFee: number;
  amountPaid: number;
  amountDue: number;
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string | null;
}

export default function StudentFeesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fee, setFee] = useState<Fee | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "STUDENT") {
      router.push("/dashboard");
      return;
    }
    fetchFees();
  }, [session, status, router]);

  const fetchFees = async () => {
    try {
      const res = await fetch("/api/fees/my");
      const data = await res.json();
      if (data.success) {
        setFee(data.fee || null);
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Failed to fetch fees:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Fees</h1>
          <p className="text-gray-600">View your fee details and payment history</p>
        </div>

        {fee && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Fee Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fee:</span>
                  <span className="font-bold">₹{fee.totalFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount ({fee.discountPercent}%):</span>
                  <span className="font-bold text-green-600">-₹{((fee.totalFee * fee.discountPercent) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Final Fee:</span>
                  <span className="font-bold text-blue-600">₹{fee.finalFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-green-600">₹{fee.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600 font-bold">Amount Due:</span>
                  <span className={`font-bold text-xl ${fee.amountDue > 0 ? "text-red-600" : "text-green-600"}`}>
                    ₹{fee.amountDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Payment History</h2>
              {payments.length === 0 ? (
                <p className="text-gray-500">No payments found</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border-b pb-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {payment.paymentMethod} {payment.transactionId && `- ${payment.transactionId}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
