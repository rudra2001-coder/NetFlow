"use client";

import React, { useState, useRef } from "react";
import {
  Upload, Download, FileSpreadsheet, Users, CheckCircle,
  XCircle, AlertCircle, ChevronRight, ArrowLeft, Search,
  Filter, RefreshCw, Eye, Trash2, Edit2, Plus, X
} from "lucide-react";
import {
  Button, Card, CardBody, CardHeader, Input, Badge, Modal,
  Select, Progress, Alert, Table
} from "@/components";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface BulkClient {
  id: string;
  username: string;
  password: string;
  profile: string;
  ipAddress: string;
  macAddress: string;
  router: string;
  status: "pending" | "success" | "failed";
  error?: string;
}

interface ImportLog {
  id: string;
  filename: string;
  totalRecords: number;
  successCount: number;
  failedCount: number;
  importedAt: string;
  status: "completed" | "failed" | "processing";
}

// Sample data for the template
const sampleData = [
  {
    username: "client001",
    password: "pass123",
    profile: "PPPoE_Static_100M",
    ipAddress: "10.10.1.1",
    macAddress: "FC:A1:3E:21:00:01",
    router: "MikroTik-Main",
    customerName: "John Doe",
    phone: " +8801711111111",
    email: "john@example.com",
    address: "123 Main Street, Dhaka"
  },
  {
    username: "client002",
    password: "pass456",
    profile: "Hotspot_Daily_5M",
    ipAddress: "10.10.1.2",
    macAddress: "FC:A1:3E:21:00:02",
    router: "MikroTik-Hotspot-1",
    customerName: "Jane Smith",
    phone: "+8801722222222",
    email: "jane@example.com",
    address: "456 Oak Avenue, Dhaka"
  }
];

// Mock import logs
const mockImportLogs: ImportLog[] = [
  {
    id: "log_1",
    filename: "clients_import_2024-01-15.xlsx",
    totalRecords: 50,
    successCount: 48,
    failedCount: 2,
    importedAt: "2024-01-15 14:30:00",
    status: "completed"
  },
  {
    id: "log_2",
    filename: "new_clients_january.xlsx",
    totalRecords: 100,
    successCount: 95,
    failedCount: 5,
    importedAt: "2024-01-20 10:15:00",
    status: "completed"
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

const generateSampleCSV = (): string => {
  const headers = [
    "username", "password", "profile", "ipAddress", "macAddress", 
    "router", "customerName", "phone", "email", "address"
  ].join(",");
  
  const rows = sampleData.map(row => 
    [row.username, row.password, row.profile, row.ipAddress, 
     row.macAddress, row.router, row.customerName, row.phone, 
     row.email, row.address].join(",")
  );
  
  return [headers, ...rows].join("\n");
};

const downloadSampleFile = () => {
  const csvContent = generateSampleCSV();
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "sample_client_import.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================================================================
// Main Component
// ============================================================================

export default function BulkClientImportPage() {
  const [activeTab, setActiveTab] = useState<"import" | "logs">("import");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<BulkClient[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [importLogs] = useState<ImportLog[]>(mockImportLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter logs
  const filteredLogs = importLogs.filter(log => {
    const matchesSearch = log.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle file drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file selection
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process uploaded file
  const handleFile = (file: File) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      alert("Please upload a valid CSV or Excel file");
      return;
    }

    setSelectedFile(file);
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate file parsing
    setTimeout(() => {
      setUploading(false);
      // Generate preview data
      const preview: BulkClient[] = sampleData.map((item, index) => ({
        id: `preview_${index}`,
        username: item.username,
        password: item.password,
        profile: item.profile,
        ipAddress: item.ipAddress,
        macAddress: item.macAddress,
        router: item.router,
        status: "pending"
      }));
      setPreviewData(preview);
      setShowPreviewModal(true);
    }, 2500);
  };

  // Import clients
  const handleImport = () => {
    setShowPreviewModal(false);
    setSelectedFile(null);
    setPreviewData([]);
    alert("Import started! Clients will be added to the system.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Client Import</h1>
            <p className="text-sm text-gray-500 mt-1">
              Import multiple clients from Excel/CSV files
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={downloadSampleFile}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sample
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("import")}
            className={cn(
              "pb-3 px-1 text-sm font-medium transition-colors border-b-2",
              activeTab === "import"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Upload className="w-4 h-4 inline-block mr-2" />
            Import Clients
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "pb-3 px-1 text-sm font-medium transition-colors border-b-2",
              activeTab === "logs"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <RefreshCw className="w-4 h-4 inline-block mr-2" />
            Import History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "import" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
          <Card>
            <CardHeader
              title="Upload Client File"
              subtitle="Drag and drop your Excel or CSV file here"
            />
              <CardBody>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400",
                    uploading && "pointer-events-none opacity-50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <div className="space-y-4">
                      <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
                      <p className="text-sm text-gray-600">
                        Processing {selectedFile?.name}...
                      </p>
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-500">
                        {uploadProgress}% complete
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Drag and drop your file here, or{" "}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:underline"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports CSV, XLS, XLSX (Max 10,000 rows)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    <AlertCircle className="w-4 h-4 inline-block mr-2" />
                    Instructions
                  </h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Download the sample file using the button above</li>
                    <li>Fill in the client data in the Excel/CSV file</li>
                    <li>Upload the file to import clients</li>
                    <li>Review the preview and confirm to import</li>
                  </ol>
                </div>
              </CardBody>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Import Statistics"
                />
                <CardBody>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-700">1,247</p>
                          <p className="text-sm text-green-600">Total Imported</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-700">23</p>
                          <p className="text-sm text-red-600">Failed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="File Format Requirements"
                />
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">username</span>
                      <Badge variant="warning">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">password</span>
                      <Badge variant="warning">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">profile</span>
                      <Badge variant="warning">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">ipAddress</span>
                      <Badge variant="default">Optional</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">macAddress</span>
                      <Badge variant="default">Optional</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">router</span>
                      <Badge variant="default">Optional</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">customerName</span>
                      <Badge variant="default">Optional</Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        ) : (
          /* Import Logs Tab */
          <Card>
            <CardHeader
              title="Import History"
              action={
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                  <Select
                    value={filterStatus}
                    onChange={(value) => setFilterStatus(value)}
                    options={[
                      { value: "all", label: "All Status" },
                      { value: "completed", label: "Completed" },
                      { value: "failed", label: "Failed" },
                      { value: "processing", label: "Processing" }
                    ]}
                    className="w-40"
                  />
                </div>
              }
            />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Success
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Failed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {log.filename}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.totalRecords}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-green-600 font-medium">
                            {log.successCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-red-600 font-medium">
                            {log.failedCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.importedAt}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              log.status === "completed"
                                ? "success"
                                : log.status === "failed"
                                ? "error"
                                : "warning"
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Preview Import Data"
        size="xl"
      >
        <div className="space-y-4">
          <Alert variant="info">
            <span>
              Review the data below before importing. Failed records will not be imported.
            </span>
          </Alert>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Username</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Password</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Profile</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">IP Address</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Router</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((client) => (
                  <tr key={client.id}>
                    <td className="px-4 py-2 text-sm">{client.username}</td>
                    <td className="px-4 py-2 text-sm">{client.password}</td>
                    <td className="px-4 py-2 text-sm">{client.profile}</td>
                    <td className="px-4 py-2 text-sm">{client.ipAddress}</td>
                    <td className="px-4 py-2 text-sm">{client.router}</td>
                    <td className="px-4 py-2">
                      <Badge variant="warning">{client.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowPreviewModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import {previewData.length} Clients
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
