// itineraryPdfExport.js - Simple PDF export functionality

const ItineraryPdfExport = {
    // Simple document styling with nature-inspired colors
    styling: {
        colors: {
            primary: '#2E5A4B',    // Forest green for main headings
            secondary: '#5D8C5D',  // Sage green for subheadings
            accent: '#8A4117',     // Terra cotta for accents
            text: '#333333',       // Dark gray for text
            line: '#BECFB8',       // Light sage for separator lines
            background: '#F7F9F4'  // Very light green tint for backgrounds
        },
        fonts: {
            title: { size: 18 },
            heading: { size: 14 },
            subheading: { size: 12 },
            normal: { size: 10 },
            small: { size: 8 }
        },
        margins: {
            page: 20,
            paragraph: 10,
            lineSpacing: 1.5      // Line spacing multiplier for better readability
        }
    },

    // Main export functio
    exportToPdf: function(itinerary) {
        if (!itinerary) {
            console.error('No itinerary data provided for PDF export');
            return;
        }

        // Dynamically load jsPDF
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        
        script.onload = () => {
            try {
                const { jsPDF } = window.jspdf;
                this.generatePdf(jsPDF, itinerary);
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Sorry, there was an error generating your PDF. Please try again.');
            }
        };
        
        script.onerror = () => {
            console.error('Failed to load jsPDF library');
            alert('Sorry, there was an error loading the PDF library. Please check your internet connection.');
        };
        
        document.head.appendChild(script);
    },

    // Generate the PDF document
    generatePdf: function(jsPDF, itinerary) {
        // Create new PDF document
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = this.styling.margins.page;
        const contentWidth = pageWidth - (margin * 2);
        
        // Initialize position tracker
        let y = margin;
        
        // Utility functions for page management
        const addPage = () => {
            doc.addPage();
            this.addFooter(doc, doc.internal.getNumberOfPages(), doc.internal.getNumberOfPages(), pageWidth, pageHeight);
            return margin;
        };
        
        // Check page overflow
        const checkPageOverflow = (currentY, neededSpace) => {
            if (currentY + neededSpace > pageHeight - margin - 15) {
                return addPage();
            }
            return currentY;
        };
        
        // Add title page
        this.addTitlePage(doc, itinerary, pageWidth, pageHeight);
        
        // Add introduction page
        y = addPage();
        y = this.addPageHeading(doc, 'INTRODUCTION', y, margin, contentWidth);
        y = this.addTextContent(doc, this.cleanText(itinerary.introduction), margin, y, contentWidth);
        
        // Add daily itinerary
        for (let i = 0; i < itinerary.days.length; i++) {
            y = addPage();
            y = this.addPageHeading(doc, `DAY ${i+1}`, y, margin, contentWidth);
            y = this.addDayContent(doc, itinerary.days[i], i+1, margin, y, contentWidth, checkPageOverflow);
        }
        
        // Add information sections (one per page)
        y = addPage();
        y = this.addPageHeading(doc, 'ESSENTIAL TRAVEL INFORMATION', y, margin, contentWidth);
        y = this.addInfoSections(doc, itinerary.essentialTravelInfo, margin, y, contentWidth, checkPageOverflow);
        
        y = addPage();
        y = this.addPageHeading(doc, 'PRACTICAL MATTERS', y, margin, contentWidth);
        y = this.addInfoSections(doc, itinerary.practicalMatters, margin, y, contentWidth, checkPageOverflow);
        
        y = addPage();
        y = this.addPageHeading(doc, 'INSIDER KNOWLEDGE', y, margin, contentWidth);
        y = this.addInfoSections(doc, itinerary.insiderKnowledge, margin, y, contentWidth, checkPageOverflow);
        
        // Add ending page
        this.addEndingPage(doc, pageWidth, pageHeight);
        
        // Add footer to all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            if (i > 1 && i < totalPages) { // Skip footer on cover page and ending page
                this.addFooter(doc, i, totalPages - 1, pageWidth, pageHeight);
            }
        }
        
        // Save the PDF
        const filename = `${itinerary.destination.replace(/\s+/g, '-')}-Itinerary.pdf`;
        doc.save(filename);
    },
    
    // Clean text of any markdown or special characters
    cleanText: function(text) {
        if (!text) return '';
        
        return text
            .replace(/\*\*/g, '')                // Remove bold markers
            .replace(/#+\s+/g, '')               // Remove heading markers
            .replace(/###/g, '')                 // Remove hash symbols
            .replace(/\n\s*-\s+/g, '\n• ')       // Convert dash lists to bullet points
            .replace(/•\s*\*\*/g, '• ')          // Clean bullet points with stars
            .replace(/•\s*$/gm, '')              // Remove bullet points at end of lines
            .replace(/•\s*\n\s*•\s*$/g, '')      // Remove trailing bullet points
            .replace(/•\s*\n\s*$/g, '')          // Remove trailing bullet point at end of section
            .replace(/\n•\s*\n/g, '\n')          // Remove standalone bullet points
            .replace(/\n•\s*$/g, '')             // Remove bullet points at end of text
            .replace(/•\s*\n(\s*\n)+/g, '\n\n')  // Remove bullets followed by multiple newlines
            .trim();
    },
    
    // Add a simple title page with nature background tint
    addTitlePage: function(doc, itinerary, pageWidth, pageHeight) {
        const margin = this.styling.margins.page;
        
        // Add light background
        doc.setFillColor(this.styling.colors.background);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        let y = pageHeight / 3;
        
        // Destination title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(this.styling.fonts.title.size + 8);
        doc.setTextColor(this.styling.colors.primary);
        doc.text('Cultural Journey to', pageWidth/2, y, { align: 'center' });
        
        y += 15;
        
        // Clean destination name
        const cleanDestination = this.cleanText(itinerary.destination);
        doc.setFontSize(this.styling.fonts.title.size + 10);
        doc.text(cleanDestination.toUpperCase(), pageWidth/2, y, { align: 'center' });
        
        y += 15;
        
        // Add horizontal line
        doc.setDrawColor(this.styling.colors.accent);
        doc.setLineWidth(0.7);
        doc.line(margin + 30, y, pageWidth - margin - 30, y);
        
        y += 20;
        
        // Add subtitle
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(this.styling.fonts.heading.size);
        doc.setTextColor(this.styling.colors.secondary);
        doc.text('Your Personalized Travel Itinerary', pageWidth/2, y, { align: 'center' });
        
        // Add date at the bottom
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(this.styling.fonts.normal.size);
        doc.setTextColor(this.styling.colors.text);
        const date = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.text(date, pageWidth/2, pageHeight - 30, { align: 'center' });
    },
    
    // Add a page heading with better alignment for long headers
    addPageHeading: function(doc, title, y, margin, contentWidth) {
        // Add heading with proper line wrapping
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(this.styling.fonts.title.size);
        doc.setTextColor(this.styling.colors.primary);
        
        // Check if the heading is too long for one line
        const titleWidth = doc.getTextDimensions(title).w;
        
        if (titleWidth > contentWidth) {
            // Split long heading into multiple lines
            const words = title.split(' ');
            let line = '';
            let lineY = y + 10;
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const testWidth = doc.getTextDimensions(testLine).w;
                
                if (testWidth > contentWidth && i > 0) {
                    doc.text(line.trim(), margin, lineY);
                    line = words[i] + ' ';
                    lineY += 8; // Line height for title
                } else {
                    line = testLine;
                }
            }
            
            // Add the last line
            if (line.trim() !== '') {
                doc.text(line.trim(), margin, lineY);
                lineY += 8;
            }
            
            // Add underline below the last line of text
            doc.setDrawColor(this.styling.colors.secondary);
            doc.setLineWidth(0.5);
            doc.line(margin, lineY + 3, margin + contentWidth, lineY + 3);
            
            return lineY + 13; // Return new Y position after multi-line heading
        } else {
            // Single line heading
            doc.text(title, margin, y + 10);
            
            // Add underline
            doc.setDrawColor(this.styling.colors.secondary);
            doc.setLineWidth(0.5);
            doc.line(margin, y + 15, margin + contentWidth, y + 15);
            
            return y + 25; // Return new Y position
        }
    },
    
    // Add page footer
    addFooter: function(doc, pageNumber, totalPages, pageWidth, pageHeight) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(this.styling.fonts.small.size);
        doc.setTextColor(this.styling.colors.text);
        
        // Add horizontal line
        doc.setDrawColor(this.styling.colors.line);
        doc.setLineWidth(0.5);
        doc.line(this.styling.margins.page, pageHeight - 15, 
                 pageWidth - this.styling.margins.page, pageHeight - 15);
        
        // Page number
        doc.text(`Page ${pageNumber} of ${totalPages}`, this.styling.margins.page, pageHeight - 10);
        
        // Branding
        doc.text('YatraGPT', pageWidth - this.styling.margins.page, pageHeight - 10, { align: 'right' });
    },
    
    // Add text content with automatic page breaks and improved line spacing
    addTextContent: function(doc, text, x, y, width, fontSize = this.styling.fonts.normal.size) {
        // Clean any remaining trailing bullet points
        text = text.replace(/•\s*$/g, '').replace(/\n•\s*\n/g, '\n').trim();
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(this.styling.colors.text);
        
        // Split text to fit width
        const lines = doc.splitTextToSize(text, width);
        const lineHeight = (fontSize / 72) * 25.4 * this.styling.margins.lineSpacing; // Convert pt to mm with spacing
        
        // Calculate if text will fit on current page
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxY = pageHeight - this.styling.margins.page - 20;
        
        if (y + (lines.length * lineHeight) > maxY) {
            // Calculate how many lines fit on current page
            const linesPerPage = Math.floor((maxY - y) / lineHeight);
            
            // Add lines that fit to current page
            if (linesPerPage > 0) {
                for (let i = 0; i < linesPerPage; i++) {
                    doc.text(lines[i], x, y + (i * lineHeight));
                }
                
                // Add new page
                doc.addPage();
                this.addFooter(doc, doc.internal.getNumberOfPages(), doc.internal.getNumberOfPages(), 
                               doc.internal.pageSize.getWidth(), pageHeight);
                
                // Add remaining lines to new page
                return this.addTextContent(doc, lines.slice(linesPerPage).join('\n'), 
                                        x, this.styling.margins.page, width, fontSize);
            }
        }
        
        // Text fits on current page - add with proper line spacing
        for (let i = 0; i < lines.length; i++) {
            doc.text(lines[i], x, y + (i * lineHeight));
        }
        
        return y + (lines.length * lineHeight) + this.styling.margins.paragraph;
    },
    
    // Add section heading with better line handling
    addSectionHeading: function(doc, title, y, margin, contentWidth) {
        // Check if we need to add space before the heading
        if (y > this.styling.margins.page + 30) {
            y += 10; // Add some space before the heading
        }
        
        // Add heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(this.styling.fonts.heading.size);
        doc.setTextColor(this.styling.colors.secondary);
        
        // Check if title is too long for one line
        const titleWidth = doc.getTextDimensions(title).w;
        
        if (titleWidth > contentWidth - 30) {
            // Split long heading into multiple lines
            const words = title.split(' ');
            let line = '';
            let lineY = y;
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const testWidth = doc.getTextDimensions(testLine).w;
                
                if (testWidth > contentWidth - 30 && i > 0) {
                    doc.text(line.trim(), margin, lineY);
                    line = words[i] + ' ';
                    lineY += 7; // Line height for heading
                } else {
                    line = testLine;
                }
            }
            
            // Add the last line
            if (line.trim() !== '') {
                doc.text(line.trim(), margin, lineY);
                lineY += 7;
            }
            
            // Add light line below the last line
            doc.setDrawColor(this.styling.colors.line);
            doc.setLineWidth(0.3);
            doc.line(margin, lineY + 3, margin + contentWidth - 20, lineY + 3);
            
            return lineY + 10; // Return new Y position after multi-line heading
        } else {
            // Single line heading
            doc.text(title, margin, y);
            
            // Add light line below
            doc.setDrawColor(this.styling.colors.line);
            doc.setLineWidth(0.3);
            doc.line(margin, y + 5, margin + contentWidth - 20, y + 5);
            
            return y + 15; // Return new Y position
        }
    },
    
    // Add a day content with improved spacing
    addDayContent: function(doc, day, dayNumber, margin, y, contentWidth, checkPageOverflow) {
        // Add day title if provided
        if (day.title) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(this.styling.fonts.heading.size);
            doc.setTextColor(this.styling.colors.secondary);
            doc.text(this.cleanText(day.title), margin, y);
            y += 10;
        }
        
        // Add each time period
        const activities = [
            { title: "MORNING", content: day.activities.morning },
            { title: "LUNCH", content: day.activities.lunch },
            { title: "AFTERNOON", content: day.activities.afternoon },
            { title: "EVENING", content: day.activities.evening }
        ];
        
        activities.forEach(activity => {
            if (!activity.content) return;
            
            // Clean content
            const content = this.cleanText(activity.content);
            
            // Check if enough space for this section (minimum 40mm)
            y = checkPageOverflow(y, 40);
            
            // Add time period heading
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(this.styling.fonts.subheading.size);
            doc.setTextColor(this.styling.colors.accent);
            doc.text(activity.title, margin, y);
            
            y += 7; // Increased spacing after activity heading
            
            // Extract location if present in format "MORNING: Location"
            const firstLine = activity.content.split('\n')[0];
            const locationMatch = firstLine.match(new RegExp(`${activity.title}\\s*:\\s*(.+)`, 'i'));
            if (locationMatch && locationMatch[1]) {
                const location = this.cleanText(locationMatch[1]);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(this.styling.fonts.normal.size);
                doc.setTextColor(this.styling.colors.secondary);
                doc.text(location, margin + 15, y);
                y += 7; // Increased spacing after location
            }
            
            // Add activity content
            const cleanContent = content.replace(new RegExp(`${activity.title}\\s*:?\\s*(.+)?`, 'i'), '').trim();
            if (cleanContent) {
                y = this.addTextContent(doc, cleanContent, margin + 5, y, contentWidth - 15);
            }
            
            // Add separator line with better spacing
            y += 5; // Space before separator
            doc.setDrawColor(this.styling.colors.line);
            doc.setLineWidth(0.2);
            doc.line(margin + 10, y, margin + contentWidth - 10, y);
            
            y += 12; // Increased spacing between activities
        });
        
        return y;
    },
    
    // Add information sections with improved handling
    addInfoSections: function(doc, content, margin, y, contentWidth, checkPageOverflow) {
        if (!content) return y;
        
        // Clean the content with additional bullet point cleanup
        let cleanContent = this.cleanText(content);
        
        // Additional cleanup for sections format
        cleanContent = cleanContent
            .replace(/\n•\s*\n/g, '\n')          // Remove standalone bullet points
            .replace(/•\s*$/g, '')               // Remove trailing bullets
            .replace(/•\s*\n\s*([A-Z][A-Z\s&\-]+):/g, '\n$1:') // Fix bullets before section headers
            .trim();
        
        // Find section headers - look for capitalized text followed by colon
        const sectionPattern = /\n?([A-Z][A-Z\s&\-]+):/g;
        let sections = [];
        let match;
        
        // Collect all section headers
        while ((match = sectionPattern.exec(cleanContent)) !== null) {
            sections.push({
                title: match[1],
                startIndex: match.index,
                endIndex: cleanContent.length // Will be updated for all but the last section
            });
        }
        
        // Update end indexes
        for (let i = 0; i < sections.length - 1; i++) {
            sections[i].endIndex = sections[i + 1].startIndex;
        }
        
        // If no sections found, display content as is
        if (sections.length === 0) {
            return this.addTextContent(doc, cleanContent, margin, y, contentWidth);
        }
        
        // Process each section
        sections.forEach(section => {
            // Extract section content
            let sectionContent = cleanContent
                .substring(section.startIndex, section.endIndex)
                .replace(section.title + ':', '')
                .trim();
                
            // Additional cleanup for each section content
            sectionContent = sectionContent
                .replace(/\n•\s*\n/g, '\n')       // Remove standalone bullet points
                .replace(/•\s*$/g, '')            // Remove trailing bullets
                .trim();
            
            // Check if enough space for this section (minimum 50mm)
            y = checkPageOverflow(y, 50);
            
            // Add section heading
            y = this.addSectionHeading(doc, section.title, y, margin, contentWidth);
            
            // Add section content with indentation
            y = this.addTextContent(doc, sectionContent, margin + 8, y, contentWidth - 16);
        });
        
        return y;
    },
    
    // Add an ending page
    addEndingPage: function(doc, pageWidth, pageHeight) {
        // Add new page
        doc.addPage();
        
        // Add light background
        doc.setFillColor(this.styling.colors.background);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        const margin = this.styling.margins.page;
        let y = pageHeight / 3;
        
        // Add thank you heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(this.styling.fonts.title.size + 4);
        doc.setTextColor(this.styling.colors.primary);
        doc.text('Thank You For Choosing', pageWidth/2, y, { align: 'center' });
        
        y += 15;
        
        // Add company name
        doc.setFontSize(this.styling.fonts.title.size + 8);
        doc.text('YatraGPT', pageWidth/2, y, { align: 'center' });
        
        y += 15;
        
        // Add horizontal line
        doc.setDrawColor(this.styling.colors.accent);
        doc.setLineWidth(0.7);
        doc.line(margin + 30, y, pageWidth - margin - 30, y);
        
        y += 25;
        
        // Add contact information
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(this.styling.fonts.normal.size);
        doc.setTextColor(this.styling.colors.text);
        
        const contactInfo = [
            "We hope you enjoy your cultural journey!",
            "",
            "If you need any assistance during your travels, please contact us:",
            "",
            "Email: support@yatragpt.com",
            "Phone: +1-555-YATRAGPT",
            "Website: www.yatragpt.com",
            "",
            "Follow us on social media for travel tips and inspiration:",
            "@YatraGPT"
        ];
        
        // Add contact text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(this.styling.fonts.normal.size + 1);
        contactInfo.forEach((line, index) => {
            doc.text(line, pageWidth/2, y + (index * 8), { align: 'center' });
        });
        
        // Add footer with copyright
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(this.styling.fonts.small.size);
        doc.text('© ' + new Date().getFullYear() + ' YatraGPT. All rights reserved.', 
                 pageWidth/2, pageHeight - 20, { align: 'center' });
    }
};

export default ItineraryPdfExport; 