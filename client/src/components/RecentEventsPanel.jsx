import React, { useState, useEffect } from "react";
import { Activity, Clock, User, TrendingUp } from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";

const RecentEventsPanel = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRecentEvents = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/hikvision/latest-events?limit=10`);
            if (response.data.success) {
                setEvents(response.data.events);
            }
        } catch (error) {
            console.error("Failed to load recent events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecentEvents();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadRecentEvents, 30000);
        return () => clearInterval(interval);
    }, []);

    const getEventIcon = (eventType) => {
        if (eventType === "IN") {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        }
        return <Activity className="w-4 h-4 text-orange-600" />;
    };

    const getEventBadge = (eventType) => {
        if (eventType === "IN") {
            return (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Keldi
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Ketdi
            </span>
        );
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("uz-UZ", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();

        if (date.toDateString() === today.toDateString()) {
            return "Bugun";
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Kecha";
        }

        return date.toLocaleDateString("uz-UZ", {
            day: "2-digit",
            month: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                        Oxirgi Eventlar
                    </h3>
                </div>
                <span className="text-sm text-gray-500">{events.length} ta</span>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Hozircha eventlar yo'q
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((event, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="flex-shrink-0">
                                    {getEventIcon(event.eventType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {event.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {event.department || "Xodim"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                {getEventBadge(event.eventType)}
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {event.time}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(event.timestamp)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    Avtomatik yangilanadi (har 30 soniya)
                </div>
            </div>
        </div>
    );
};

export default RecentEventsPanel;

