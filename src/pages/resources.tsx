"use client";

import { useState } from "react";
import {
  BookOpen,
  Car,
  Users,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import Navbar from "../components/Navbar";
import {
  academicResources,
  transportResources,
  specialFeatures,
  getFeaturedResources,
} from "../lib/resourcesConfig";

interface CabpoolingEntry {
  date: string;
  name: string;
  arrivalTime: string;
  airport: string;
  terminal: string;
  whatsapp: string;
  openToShare: boolean;
  luggage: string;
}

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"resources" | "cabpooling">(
    "resources"
  );

  // Sample cabpooling data (in real app, this would come from the Google Sheet)
  const cabpoolingData: CabpoolingEntry[] = [
    {
      date: "15th Friday",
      name: "Woojin",
      arrivalTime: "AM 7:55",
      airport: "CDG Airport",
      terminal: "2F",
      whatsapp: "821025850385",
      openToShare: true,
      luggage: "1 big, 1 medium, 1 small",
    },
    {
      date: "16th Saturday",
      name: "Daniel",
      arrivalTime: "AM 7:00",
      airport: "CDG Airport",
      terminal: "2E",
      whatsapp: "81 80-4340-1088",
      openToShare: true,
      luggage: "2 Big",
    },
    {
      date: "13th Wednesday",
      name: "Devesh",
      arrivalTime: "AM 9:25",
      airport: "CDG Airport",
      terminal: "2C",
      whatsapp: "91 9307749133",
      openToShare: true,
      luggage: "",
    },
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="h-6 w-6" />;
      case "Car":
        return <Car className="h-6 w-6" />;
      case "Users":
        return <Users className="h-6 w-6" />;
      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };

  const featuredResources = getFeaturedResources();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Resources & Specials
            </h1>
            <p className="text-gray-600">
              Academic resources, transport options, and special features for
              HEC students
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "resources"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Academic Resources
                </button>
                <button
                  onClick={() => setActiveTab("cabpooling")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "cabpooling"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Cabpooling System
                </button>
              </nav>
            </div>
          </div>

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="space-y-8">
              {/* Featured Resources */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Featured Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="card hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-primary-600">
                            {getIconComponent(resource.icon)}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {resource.title}
                          </h3>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {resource.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Resources */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Academic Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {academicResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-primary-600">
                          {getIconComponent(resource.icon)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {resource.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Features */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Special Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {specialFeatures.map((resource) => (
                    <div
                      key={resource.id}
                      className="card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-primary-600">
                          {getIconComponent(resource.icon)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {resource.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <a
                          href={resource.url}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cabpooling Tab */}
          {activeTab === "cabpooling" && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      CDG Airport Cabpooling
                    </h2>
                    <p className="text-gray-600">
                      Find ride-sharing partners for airport transfers
                    </p>
                  </div>
                  <a
                    href="https://cdg-hec-cabpooler-gg.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Cabpooling System
                  </a>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">
                    How it works:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Match with students arriving within 1.5 hours of your
                      arrival time
                    </li>
                    <li>
                      • Share transportation costs and reduce your carbon
                      footprint
                    </li>
                    <li>• Connect via WhatsApp to coordinate pickup details</li>
                    <li>
                      • Available for CDG Airport, Orly Airport, and train
                      stations
                    </li>
                  </ul>
                </div>

                {/*<div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Airport/Station
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Terminal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Luggage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cabpoolingData.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{entry.date}</div>
                            <div className="text-sm text-gray-500">{entry.arrivalTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.airport}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.terminal}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={`https://wa.me/${entry.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 text-sm"
                            >
                              <Phone className="h-4 w-4 inline mr-1" />
                              Contact
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.luggage || 'Not specified'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>*/}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
