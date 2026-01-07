import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { base44 } from '@/api/base44Client';
import {
    Upload, X, GripVertical, Image as ImageIcon,
    Car, DollarSign, MapPin, FileText, Settings, Loader2
} from 'lucide-react';

const MAKES = ['Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Tesla', 'Lexus', 'Land Rover', 'Jaguar', 'Maserati', 'Ferrari', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'Lamborghini', 'McLaren'];
const BODY_TYPES = ['sedan', 'suv', 'coupe', 'truck', 'convertible', 'wagon', 'van', 'hatchback'];
const FUEL_TYPES = ['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid'];
const CONDITIONS = ['new', 'certified_preowned', 'excellent', 'good', 'fair'];
const TRANSMISSIONS = ['automatic', 'manual', 'cvt'];
const DRIVETRAINS = ['fwd', 'rwd', 'awd', '4wd'];

const FEATURES = [
    'Leather Seats', 'Sunroof', 'Navigation', 'Backup Camera', 'Bluetooth',
    'Heated Seats', 'Apple CarPlay', 'Android Auto', 'Parking Sensors',
    'Blind Spot Monitor', 'Lane Assist', 'Adaptive Cruise Control',
    'Premium Sound', 'Keyless Entry', 'Remote Start', 'Third Row Seating'
];

export default function VehicleForm({ vehicle, dealer, onSave, onCancel }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [formData, setFormData] = useState({
        make: vehicle?.make || '',
        model: vehicle?.model || '',
        year: vehicle?.year || new Date().getFullYear(),
        price: vehicle?.price || '',
        mileage: vehicle?.mileage || '',
        condition: vehicle?.condition || 'excellent',
        body_type: vehicle?.body_type || 'sedan',
        exterior_color: vehicle?.exterior_color || '',
        interior_color: vehicle?.interior_color || '',
        transmission: vehicle?.transmission || 'automatic',
        fuel_type: vehicle?.fuel_type || 'gasoline',
        engine: vehicle?.engine || '',
        drivetrain: vehicle?.drivetrain || 'awd',
        vin: vehicle?.vin || '',
        features: vehicle?.features || [],
        description: vehicle?.description || '',
        images: vehicle?.images || [],
        primary_image: vehicle?.primary_image || '',
        location_city: vehicle?.location_city || dealer?.city || '',
        location_state: vehicle?.location_state || dealer?.state || '',
        location_zip: vehicle?.location_zip || dealer?.zip_code || '',
        dealer_id: dealer?.id || '',
        dealer_name: dealer?.business_name || '',
        status: vehicle?.status || 'pending'
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFeatureToggle = (feature) => {
        const newFeatures = formData.features.includes(feature)
            ? formData.features.filter(f => f !== feature)
            : [...formData.features, feature];
        handleChange('features', newFeatures);
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        const uploadedUrls = [];

        for (const file of files) {
            // Mock upload
            // const { file_url } = await base44.integrations.Core.UploadFile({ file });
            // Mock URL creation from local file for preview
            const file_url = URL.createObjectURL(file);
            uploadedUrls.push(file_url);
        }

        const newImages = [...formData.images, ...uploadedUrls];
        handleChange('images', newImages);
        if (!formData.primary_image && newImages.length > 0) {
            handleChange('primary_image', newImages[0]);
        }
        setUploadingImages(false);
    };

    const removeImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        handleChange('images', newImages);
        if (formData.primary_image === formData.images[index]) {
            handleChange('primary_image', newImages[0] || '');
        }
    };

    const setPrimaryImage = (url) => {
        handleChange('primary_image', url);
    };

    const handleSubmit = async () => {
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i);

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStep(s)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === s
                                ? 'bg-gray-900 text-white'
                                : step > s
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-500'
                            }`}
                    >
                        {s === 1 && <Car className="w-4 h-4" />}
                        {s === 2 && <Settings className="w-4 h-4" />}
                        {s === 3 && <ImageIcon className="w-4 h-4" />}
                        {s === 4 && <FileText className="w-4 h-4" />}
                        {['Vehicle Info', 'Details', 'Photos', 'Review'][s - 1]}
                    </button>
                ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5" />
                            Vehicle Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label>Make *</Label>
                            <Select value={formData.make} onValueChange={(v) => handleChange('make', v)}>
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue placeholder="Select make" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MAKES.map(make => (
                                        <SelectItem key={make} value={make}>{make}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Model *</Label>
                            <Input
                                value={formData.model}
                                onChange={(e) => handleChange('model', e.target.value)}
                                placeholder="e.g., A4, 3 Series, E-Class"
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label>Year *</Label>
                            <Select value={String(formData.year)} onValueChange={(v) => handleChange('year', parseInt(v))}>
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(year => (
                                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Price (USD) *</Label>
                            <div className="relative mt-1.5">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                    placeholder="45,000"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Mileage *</Label>
                            <Input
                                type="number"
                                value={formData.mileage}
                                onChange={(e) => handleChange('mileage', parseInt(e.target.value))}
                                placeholder="25,000"
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label>Condition *</Label>
                            <Select value={formData.condition} onValueChange={(v) => handleChange('condition', v)}>
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONDITIONS.map(c => (
                                        <SelectItem key={c} value={c} className="capitalize">
                                            {c.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>VIN</Label>
                            <Input
                                value={formData.vin}
                                onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
                                placeholder="17-character VIN"
                                maxLength={17}
                                className="mt-1.5 font-mono"
                            />
                        </div>

                        <div>
                            <Label>Body Type</Label>
                            <Select value={formData.body_type} onValueChange={(v) => handleChange('body_type', v)}>
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BODY_TYPES.map(type => (
                                        <SelectItem key={type} value={type} className="capitalize">
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Technical Details */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Technical Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label>Transmission</Label>
                                <Select value={formData.transmission} onValueChange={(v) => handleChange('transmission', v)}>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TRANSMISSIONS.map(t => (
                                            <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Fuel Type</Label>
                                <Select value={formData.fuel_type} onValueChange={(v) => handleChange('fuel_type', v)}>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FUEL_TYPES.map(f => (
                                            <SelectItem key={f} value={f} className="capitalize">
                                                {f.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Drivetrain</Label>
                                <Select value={formData.drivetrain} onValueChange={(v) => handleChange('drivetrain', v)}>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DRIVETRAINS.map(d => (
                                            <SelectItem key={d} value={d} className="uppercase">{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Engine</Label>
                                <Input
                                    value={formData.engine}
                                    onChange={(e) => handleChange('engine', e.target.value)}
                                    placeholder="e.g., 3.0L V6 Twin-Turbo"
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label>Exterior Color</Label>
                                <Input
                                    value={formData.exterior_color}
                                    onChange={(e) => handleChange('exterior_color', e.target.value)}
                                    placeholder="e.g., Glacier White"
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label>Interior Color</Label>
                                <Input
                                    value={formData.interior_color}
                                    onChange={(e) => handleChange('interior_color', e.target.value)}
                                    placeholder="e.g., Black Leather"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Features</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {FEATURES.map(feature => (
                                    <Badge
                                        key={feature}
                                        variant={formData.features.includes(feature) ? 'default' : 'outline'}
                                        className={`cursor-pointer transition-colors ${formData.features.includes(feature)
                                                ? 'bg-amber-500 hover:bg-amber-600'
                                                : 'hover:bg-gray-100'
                                            }`}
                                        onClick={() => handleFeatureToggle(feature)}
                                    >
                                        {feature}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Location</Label>
                            <div className="grid md:grid-cols-3 gap-4 mt-2">
                                <Input
                                    value={formData.location_city}
                                    onChange={(e) => handleChange('location_city', e.target.value)}
                                    placeholder="City"
                                />
                                <Input
                                    value={formData.location_state}
                                    onChange={(e) => handleChange('location_state', e.target.value)}
                                    placeholder="State"
                                />
                                <Input
                                    value={formData.location_zip}
                                    onChange={(e) => handleChange('location_zip', e.target.value)}
                                    placeholder="ZIP"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Photos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-amber-500 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                                disabled={uploadingImages}
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                {uploadingImages ? (
                                    <Loader2 className="w-12 h-12 mx-auto text-gray-400 animate-spin" />
                                ) : (
                                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                )}
                                <p className="mt-4 text-lg font-medium text-gray-700">
                                    {uploadingImages ? 'Uploading...' : 'Drag and drop photos here'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                                <p className="text-xs text-gray-400 mt-2">Recommended: At least 10 high-quality photos</p>
                            </label>
                        </div>

                        {/* Image Grid */}
                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.images.map((url, index) => (
                                    <div
                                        key={index}
                                        className={`relative aspect-[4/3] rounded-xl overflow-hidden group ${formData.primary_image === url ? 'ring-2 ring-amber-500 ring-offset-2' : ''
                                            }`}
                                    >
                                        <img src={url} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setPrimaryImage(url)}
                                                className="text-xs"
                                            >
                                                {formData.primary_image === url ? 'Primary' : 'Set Primary'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => removeImage(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {formData.primary_image === url && (
                                            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Review & Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Describe the vehicle's history, features, and condition..."
                                className="mt-1.5 min-h-[150px]"
                            />
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                            <h4 className="font-semibold text-lg">Listing Summary</h4>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Vehicle:</span>
                                    <p className="font-medium">{formData.year} {formData.make} {formData.model}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Price:</span>
                                    <p className="font-medium text-emerald-600">
                                        ${formData.price?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Mileage:</span>
                                    <p className="font-medium">{formData.mileage?.toLocaleString() || 0} miles</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Condition:</span>
                                    <p className="font-medium capitalize">{formData.condition.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Location:</span>
                                    <p className="font-medium">{formData.location_city}, {formData.location_state}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Photos:</span>
                                    <p className="font-medium">{formData.images.length} uploaded</p>
                                </div>
                            </div>

                            {formData.features.length > 0 && (
                                <div>
                                    <span className="text-gray-500 text-sm">Features:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {formData.features.map(f => (
                                            <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => step > 1 ? setStep(step - 1) : onCancel?.()}
                >
                    {step === 1 ? 'Cancel' : 'Back'}
                </Button>

                {step < 4 ? (
                    <Button onClick={() => setStep(step + 1)} className="bg-gray-900 hover:bg-gray-800">
                        Continue
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-amber-500 hover:bg-amber-600 text-gray-900"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : vehicle ? 'Update Listing' : 'Create Listing'}
                    </Button>
                )}
            </div>
        </div>
    );
}
