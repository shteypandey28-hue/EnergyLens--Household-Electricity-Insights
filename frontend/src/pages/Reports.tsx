import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Download, FileBarChart, PieChart } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

export const Reports: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownloadCSV = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/usage/readings');
            const readings = res.data;

            // Convert to CSV
            const csvContent = [
                ['Date', 'Units Consumed', 'Cost (INR)', 'Source'],
                ...readings.map((r: any) => [
                    format(new Date(r.date), 'yyyy-MM-dd'),
                    r.unitsConsumed,
                    r.cost,
                    r.source || 'manual'
                ])
            ].map(e => e.join(",")).join("\n");

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `energylens_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download CSV", error);
            alert("Failed to generate report");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Reports</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Generate insights and export your data</p>
                </div>
                <Button variant="outline" onClick={handleDownloadCSV} isLoading={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center group hover:shadow-lg transition-all duration-300">
                    <div className="mx-auto h-20 w-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <FileBarChart className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Monthly Statement</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Detailed breakdown of daily consumption, total units, and estimated bill for the current month.</p>
                    <Button onClick={handleDownloadCSV}>Download Report</Button>
                </div>

                <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <div className="mx-auto h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 opacity-75">
                        <PieChart className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Appliance Analytics</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Deep dive into which appliances are consuming the most energy in your household.</p>
                    <Button disabled variant="outline">Coming Soon</Button>
                </div>
            </div>
        </div>
    );
};
