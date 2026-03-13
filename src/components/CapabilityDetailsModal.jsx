import { useMemo } from 'react';
import { jsPDF } from 'jspdf';

// Validate URLs to prevent javascript:/data: injection in CSS url()
const isSafeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};
import { X, FileText, File, Download, Ship, Check, AlertTriangle, Zap, Scale, Anchor, Plane } from 'lucide-react';
import { vesselHullData, vesselHullComponents, isAerialPlatform } from '../data/vesselData';

const CapabilityDetailsModal = ({
  selectedCapabilityDetails,
  setSelectedCapabilityDetails,
  addToOutfitterCart
}) => {
  // Calculate compatible vessels based on SWaP requirements
  const compatibleVessels = useMemo(() => {
    if (!selectedCapabilityDetails?.swap) return { fits: vesselHullData, tooSmall: [] };

    const capWeight = selectedCapabilityDetails.swap.weight || 0;
    const capPower = selectedCapabilityDetails.swap.power || 0;

    const fits = [];
    const tooSmall = [];

    vesselHullData.forEach(vessel => {
      const capacity = vessel.capacity;
      if (!capacity) {
        // No capacity data - assume it fits
        fits.push({ vessel, headroom: null });
        return;
      }

      const weightFits = capacity.totalWeight >= capWeight;
      const powerFits = capacity.totalPower >= capPower;

      if (weightFits && powerFits) {
        fits.push({
          vessel,
          headroom: {
            weight: capacity.totalWeight - capWeight,
            power: capacity.totalPower - capPower,
            weightPercent: Math.round(((capacity.totalWeight - capWeight) / capacity.totalWeight) * 100),
            powerPercent: Math.round(((capacity.totalPower - capPower) / capacity.totalPower) * 100)
          }
        });
      } else {
        tooSmall.push({
          vessel,
          reason: !weightFits && !powerFits
            ? 'Exceeds weight and power'
            : !weightFits
            ? `Needs ${capWeight}kg, has ${capacity.totalWeight}kg`
            : `Needs ${capPower}kW, has ${capacity.totalPower}kW`
        });
      }
    });

    // Sort fits by remaining headroom
    fits.sort((a, b) => {
      if (!a.headroom) return 1;
      if (!b.headroom) return -1;
      return b.headroom.weightPercent - a.headroom.weightPercent;
    });

    return { fits, tooSmall };
  }, [selectedCapabilityDetails]);

  if (!selectedCapabilityDetails) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4"
      onClick={() => setSelectedCapabilityDetails(null)}
    >
      <div
        className="bg-darker rounded-xl max-w-[900px] max-h-[90vh] w-full overflow-hidden relative border border-lime-brand/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Close Button */}
        <div className="sticky top-0 bg-darkest p-6 border-b border-lime-brand/20 flex justify-between items-center z-[1001]">
          <h2 className="text-lime-brand text-2xl font-bold m-0">
            {selectedCapabilityDetails.name}
          </h2>
          <div className="flex items-center gap-4">
            {/* Category Badge */}
            <div className="bg-lime-brand/20 text-lime-brand py-1.5 px-3.5 rounded-full text-xs font-semibold uppercase">
              {selectedCapabilityDetails.category}
            </div>
            {/* TRL Badge */}
            <div
              className={`py-2 px-4 rounded-full text-sm font-semibold ${
                selectedCapabilityDetails.trl === 'TRL 9'
                  ? 'bg-green-500/20 text-green-400'
                  : selectedCapabilityDetails.trl === 'TRL 7'
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {selectedCapabilityDetails.trl}
            </div>
            <button
              onClick={() => setSelectedCapabilityDetails(null)}
              className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-md hover:text-lime-brand transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-0 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Company Header Section */}
          <div className="bg-gradient-to-br from-darkest to-darker p-8 border-b border-lime-brand/10">
            <div className="flex items-center gap-6 mb-4">
              {/* Company Logo Placeholder */}
              <div className="bg-white p-4 rounded-lg flex items-center justify-center min-w-[120px] h-[60px] text-sm font-bold text-darker">
                {selectedCapabilityDetails.provider.toUpperCase()}
              </div>

              <div className="flex-1">
                <h3 className="text-gray-400 text-xl font-bold m-0 mb-2">
                  {selectedCapabilityDetails.provider}
                </h3>
                <p className="text-gray-400 text-sm m-0">
                  {selectedCapabilityDetails.type}
                </p>
              </div>

            </div>

            {/* Security Indicators */}
            {selectedCapabilityDetails.securityLevel && (
              <div className="flex gap-2 flex-wrap">
                {selectedCapabilityDetails.securityLevel.map(level => (
                  <div
                    key={level}
                    className="bg-lime-brand/10 text-lime-brand py-1 px-3 rounded-full text-xs font-medium border border-lime-brand/30"
                  >
                    {level}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents Downloads Section */}
          {selectedCapabilityDetails.documents && selectedCapabilityDetails.documents.length > 0 && (
            <div className="bg-darkest py-6 px-12 border-b border-lime-brand/10">
              <h4 className="text-lime-brand text-lg font-bold mb-4 flex items-center gap-2">
                <Download size={20} />
                Available Documents
              </h4>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {selectedCapabilityDetails.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="bg-darker border border-lime-brand/10 rounded-lg p-4 cursor-pointer transition-all hover:border-lime-brand/30 hover:bg-[#1e2d3d]"
                    onClick={() => {
                      // Generate PDF dynamically
                      const pdf = new jsPDF('p', 'mm', 'a4');
                      const pageWidth = pdf.internal.pageSize.getWidth();
                      const margin = 20;
                      const maxLineWidth = pageWidth - margin * 2;
                      let y = 30;

                      // Helper function to add wrapped text
                      const addWrappedText = (text) => {
                        const lines = pdf.splitTextToSize(text, maxLineWidth);
                        lines.forEach(line => {
                          if (y > 270) {
                            pdf.addPage();
                            y = 20;
                          }
                          pdf.setFont('helvetica', 'normal');
                          pdf.text(line, margin, y);
                          y += 6;
                        });
                      };

                      // Header bar
                      pdf.setFillColor(203, 253, 0);
                      pdf.rect(0, 0, pageWidth, 20, 'F');

                      // Logo placeholder
                      pdf.setFontSize(14);
                      pdf.setFont('helvetica', 'bold');
                      pdf.setTextColor(0, 0, 0);
                      pdf.text('CALIBURN', margin, 13);

                      // Document type badge
                      pdf.setFontSize(10);
                      pdf.text(doc.type, pageWidth - margin - 10, 13);

                      // Title
                      pdf.setFontSize(20);
                      pdf.setFont('helvetica', 'bold');
                      pdf.setTextColor(203, 253, 0);
                      y = 40;
                      pdf.text(doc.name, margin, y);

                      // Document metadata
                      y += 15;
                      pdf.setFontSize(10);
                      pdf.setFont('helvetica', 'normal');
                      pdf.setTextColor(128, 128, 128);
                      pdf.text(`Provider: ${selectedCapabilityDetails.provider || 'N/A'}`, margin + 5, y);
                      y += 6;
                      pdf.text(`TRL: ${selectedCapabilityDetails.trl || 'N/A'}`, margin + 5, y);
                      y += 15;

                      // Description Section
                      pdf.setFontSize(12);
                      pdf.setFont('helvetica', 'bold');
                      pdf.setTextColor(203, 253, 0);
                      pdf.text('OVERVIEW', margin, y);
                      y += 8;
                      pdf.setTextColor(0, 0, 0);
                      addWrappedText(selectedCapabilityDetails.description || 'No description available.');

                      if (selectedCapabilityDetails.detailedDescription) {
                        y += 2;
                        addWrappedText(selectedCapabilityDetails.detailedDescription);
                      }

                      // Key Features
                      const features = selectedCapabilityDetails.keyFeatures || selectedCapabilityDetails.capabilities || [];
                      if (features.length > 0) {
                        y += 5;
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(203, 253, 0);
                        pdf.text('KEY FEATURES', margin, y);
                        y += 8;
                        pdf.setTextColor(0, 0, 0);
                        features.forEach((feature, i) => {
                          addWrappedText(`${i + 1}. ${feature}`);
                        });
                      }

                      // Technical Specifications
                      if (selectedCapabilityDetails.specs) {
                        y += 5;
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(203, 253, 0);
                        pdf.text('TECHNICAL SPECIFICATIONS', margin, y);
                        y += 8;
                        pdf.setTextColor(0, 0, 0);
                        Object.entries(selectedCapabilityDetails.specs).forEach(([key, value]) => {
                          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          addWrappedText(`${formattedKey}: ${value}`);
                        });
                      }

                      // Integration Notes
                      if (selectedCapabilityDetails.integrationNotes) {
                        y += 5;
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(203, 253, 0);
                        pdf.text('INTEGRATION NOTES', margin, y);
                        y += 8;
                        pdf.setTextColor(0, 0, 0);
                        addWrappedText(selectedCapabilityDetails.integrationNotes);
                      }

                      // Footer
                      const pageCount = pdf.internal.getNumberOfPages();
                      for (let i = 1; i <= pageCount; i++) {
                        pdf.setPage(i);
                        pdf.setFontSize(8);
                        pdf.setTextColor(128, 128, 128);
                        pdf.text(`© ${new Date().getFullYear()} Caliburn Maritime Technologies | Generated from Mission Bay Marketplace`, margin, 285);
                        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 285);
                      }

                      // Save the PDF
                      pdf.save(`${doc.name.replace(/\s+/g, '_')}.pdf`);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* File Icon */}
                      <div className="bg-lime-brand/10 p-3 rounded-lg shrink-0">
                        {doc.type === 'PDF' ? (
                          <FileText size={24} className="text-red-500" />
                        ) : (
                          <File size={24} className="text-lime-brand" />
                        )}
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-white text-[0.9375rem] font-semibold m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                          {doc.name}
                        </h5>
                        <p className="text-gray-400 text-xs m-0">
                          {doc.type} • {doc.size}
                        </p>
                      </div>

                      {/* Download Icon */}
                      <div className="text-lime-brand shrink-0">
                        <Download size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full-Width Banner */}
          <div
            className="h-[300px] bg-darkest relative flex items-center justify-center border-b border-lime-brand/10 bg-cover bg-center bg-no-repeat"
            style={{
              background: isSafeImageUrl(selectedCapabilityDetails.bannerImage)
                ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${encodeURI(selectedCapabilityDetails.bannerImage)})`
                : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="relative z-[1] text-center text-white px-12">
              <h3 className="text-[2rem] font-bold m-0 mb-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                {selectedCapabilityDetails.name}
              </h3>
              <p className="text-lg m-0 opacity-90 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] max-w-4xl mx-auto">
                {selectedCapabilityDetails.description}
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="py-8 px-12">

            {/* Rich Description Section */}
            <div className="mb-8">
              <h4 className="text-lime-brand text-lg font-bold mb-4">
                Overview
              </h4>
              <p className="text-gray-300 text-base leading-7 m-0">
                {selectedCapabilityDetails.detailedDescription || selectedCapabilityDetails.description}
              </p>
            </div>

            {/* Key Features Section */}
            {(selectedCapabilityDetails.keyFeatures || selectedCapabilityDetails.capabilities) && (
              <div className="mb-8">
                <h4 className="text-lime-brand text-lg font-bold mb-4">
                  Key Features
                </h4>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                  {(selectedCapabilityDetails.keyFeatures || selectedCapabilityDetails.capabilities).map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-darkest rounded-lg border border-lime-brand/10"
                    >
                      <div className="bg-lime-brand text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-gray-300 text-[0.9375rem] m-0 leading-6">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            {selectedCapabilityDetails.specs && (
              <div className="mb-8">
                <h4 className="text-lime-brand text-lg font-bold mb-4">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
                  {Object.entries(selectedCapabilityDetails.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 bg-darkest rounded-lg border border-lime-brand/10"
                    >
                      <div className="text-gray-400 text-xs uppercase mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-white text-base font-semibold">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integration Notes */}
            {selectedCapabilityDetails.integrationNotes && (
              <div className="mb-8">
                <h4 className="text-lime-brand text-lg font-bold mb-4">
                  Integration Notes
                </h4>
                <div className="p-6 bg-lime-brand/5 rounded-lg border border-lime-brand/20 border-l-4 border-l-lime-brand">
                  <p className="text-gray-300 text-[0.9375rem] leading-7 m-0">
                    {selectedCapabilityDetails.integrationNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Compatible Vessels Section */}
            {selectedCapabilityDetails.swap && (
              <div className="mb-8">
                <h4 className="text-lime-brand text-lg font-bold mb-4 flex items-center gap-2">
                  <Ship size={20} />
                  Compatible Platforms
                </h4>

                {/* SWaP Requirements */}
                <div className="flex gap-4 mb-4 p-4 bg-darkest rounded-lg border border-lime-brand/20">
                  <div className="flex items-center gap-2">
                    <Scale size={16} className="text-cyan-400" />
                    <span className="text-gray-400 text-sm">Weight:</span>
                    <span className="text-white font-semibold">{selectedCapabilityDetails.swap.weight || 0}kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-gray-400 text-sm">Power:</span>
                    <span className="text-white font-semibold">{selectedCapabilityDetails.swap.power || 0}kW</span>
                  </div>
                </div>

                {/* Compatible Vessels */}
                {compatibleVessels.fits.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Check size={16} className="text-green-400" />
                      <span className="text-green-400 text-sm font-semibold">
                        {compatibleVessels.fits.length} Compatible Platforms
                      </span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                      {compatibleVessels.fits.slice(0, 8).map(({ vessel, headroom }) => {
                        const HullComponent = vesselHullComponents[vessel.icon];
                        const isAerial = isAerialPlatform(vessel.platformType);
                        return (
                          <div
                            key={vessel.name}
                            className="p-3 bg-darkest rounded-lg border border-green-500/20 hover:border-green-500/40 transition-colors"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-10 flex items-center justify-center opacity-60">
                                {HullComponent ? (
                                  <HullComponent size={35} />
                                ) : isAerial ? (
                                  <Plane size={24} className="text-cyan-400" />
                                ) : (
                                  <Anchor size={24} className="text-blue-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-semibold truncate">{vessel.name}</div>
                                <div className="text-gray-500 text-xs">{vessel.type}</div>
                              </div>
                            </div>
                            {headroom && (
                              <div className="flex gap-2">
                                <div className="flex-1 text-center px-2 py-1 bg-cyan-500/10 rounded text-xs">
                                  <span className="text-cyan-400">{headroom.weight}kg</span>
                                  <span className="text-gray-500"> left</span>
                                </div>
                                <div className="flex-1 text-center px-2 py-1 bg-yellow-500/10 rounded text-xs">
                                  <span className="text-yellow-400">{headroom.power}kW</span>
                                  <span className="text-gray-500"> left</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {compatibleVessels.fits.length > 8 && (
                      <div className="mt-2 text-gray-500 text-sm text-center">
                        +{compatibleVessels.fits.length - 8} more platforms
                      </div>
                    )}
                  </div>
                )}

                {/* Incompatible Vessels */}
                {compatibleVessels.tooSmall.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={16} className="text-red-400" />
                      <span className="text-red-400 text-sm font-semibold">
                        {compatibleVessels.tooSmall.length} Too Small
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {compatibleVessels.tooSmall.slice(0, 6).map(({ vessel, reason }) => (
                        <div
                          key={vessel.name}
                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-gray-400"
                          title={reason}
                        >
                          {vessel.name}
                        </div>
                      ))}
                      {compatibleVessels.tooSmall.length > 6 && (
                        <div className="px-3 py-1.5 text-gray-500 text-xs">
                          +{compatibleVessels.tooSmall.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-lime-brand/10">
              <button
                onClick={() => {
                  addToOutfitterCart(selectedCapabilityDetails);
                  setSelectedCapabilityDetails(null);
                }}
                className="bg-lime-brand text-black py-3.5 px-8 rounded-lg border-none text-base font-semibold cursor-pointer transition-all hover:bg-[#b8e600]"
              >
                Add to Hull
              </button>
              <button
                onClick={() => setSelectedCapabilityDetails(null)}
                className="bg-transparent text-gray-400 py-3.5 px-8 rounded-lg border border-gray-400/30 text-base font-medium cursor-pointer transition-all hover:border-lime-brand/50 hover:text-lime-brand"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapabilityDetailsModal;
