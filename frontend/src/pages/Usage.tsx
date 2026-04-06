import React, { useState, useEffect } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Zap, AlertCircle, History } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface Reading {
    _id: string;
    date: string;
    unitsConsumed: number;
    cost: number;
}

export const Usage: React.FC = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [units, setUnits] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [readings, setReadings] = useState<Reading[]>([]);

    useEffect(() => {
        fetchReadings();
    }, []);

    const fetchReadings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/usage/readings`);
            setReadings(res.data);
        } catch (error) {
            console.error("Error fetching readings", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/usage/readings`, {
                date,
                unitsConsumed: Number(units),
                source: 'manual'
            });
            setMessage({ type: 'success', text: 'Reading added successfully!' });
            setUnits('');
            fetchReadings();
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to add reading'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Usage & Bills
                </h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                    Track your daily consumption or upload meter readings
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Manual Entry Form */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 h-fit transition-colors duration-200">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Add Manual Reading
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log your daily meter stats</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                        <Input
                            label="Units Consumed (kWh)"
                            type="number"
                            min="0"
                            step="0.01"
                            value={units}
                            onChange={(e) => setUnits(e.target.value)}
                            placeholder="e.g. 12.5"
                            required
                        />

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                <AlertCircle className="h-5 w-5" />
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Save Reading
                        </Button>
                    </form>
                </div>

                {/* History & Import */}
                <div className="space-y-8">
                    {/* CSV Upload (Visual Only for now) */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="p-3 bg-white/10 rounded-xl w-fit mb-4 backdrop-blur-sm">
                                <Zap className="h-6 w-6 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                Bulk Import
                            </h3>
                            <p className="text-gray-300 text-sm mb-6 max-w-xs">
                                Upload a CSV file containing your past meter readings to analyze trends.
                            </p>
                            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:border-white/40">
                                Upload CSV
                            </Button>
                        </div>
                        {/* Deco */}
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    {/* Recent Readings List */}
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Recent Readings</h3>
                        </div>

                        <div className="space-y-4">
                            {readings.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">No readings logged yet.</p>
                            ) : (
                                readings.slice(0, 5).map((reading) => (
                                    <div key={reading._id} className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-4 px-4 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {format(new Date(reading.date), 'MMM dd, yyyy')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Manual Entry</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white">{reading.unitsConsumed} units</p>
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">₹{reading.cost.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
