// ecoCalculator.js - Handles the eco footprint calculator functionality

// Initialize transport option selection
const initTransportOptions = () => {
    const transportOptions = document.querySelectorAll('.transport-option');
    
    transportOptions.forEach(option => {
        option.addEventListener('click', function() {
            transportOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
};

// Initialize activity option selection
const initActivityOptions = () => {
    const activityOptions = document.querySelectorAll('.activity-option');
    
    activityOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Toggle selection instead of single selection (multiple activities can be selected)
            this.classList.toggle('selected');
        });
    });
};

// Data sources for emission factors and impact scores
// Based on research from EPA, IPCC, and academic studies on tourism
const EMISSION_FACTORS = {
    transport: {
        'Flight': { shortHaul: 0.25, longHaul: 0.15 }, // kg CO₂/km
        'Train': 0.05, // kg CO₂/km
        'Bus': 0.08,   // kg CO₂/km
        'Car': 0.15    // kg CO₂/km (base value for single occupancy)
    },
    accommodation: {
        'hotel': { carbon: 150, localEconomic: 40, culturalExchange: 20 },
        'hostel': { carbon: 80, localEconomic: 60, culturalExchange: 60 },
        'apartment': { carbon: 100, localEconomic: 60, culturalExchange: 40 },
        'eco-lodge': { carbon: 50, localEconomic: 80, culturalExchange: 70 },
        'homestay': { carbon: 40, localEconomic: 90, culturalExchange: 90 }
    },
    activities: {
        'museums': { carbon: 10, culturalExchange: 80, localEconomic: 40 },
        'historical': { carbon: 5, culturalExchange: 90, localEconomic: 50 },
        'festivals': { carbon: 30, culturalExchange: 100, localEconomic: 80 },
        'workshops': { carbon: 15, culturalExchange: 90, localEconomic: 90 },
        'food': { carbon: 25, culturalExchange: 85, localEconomic: 75 }
    },
    // Carbon offset data
    offset: {
        treePerKg: 0.05, // 1 tree offsets about 20kg CO2 per year
        costPerTree: 5,  // $5 per tree
        renewableKwhPerKg: 2, // 1 kWh renewable energy prevents ~0.5kg CO2
        costPerKwh: 0.015, // $0.015 per kWh
        localProjectPerKg: 0.2, // local cultural preservation per kg carbon
        costPerLocalProject: 10 // $10 per unit
    }
};

// Helper function to calculate transport carbon footprint
const calculateTransportFootprint = (transportType, distance) => {
    // Determine if flight is short or long haul
    let carbonValue = 0;
    let culturalExchangeValue = 0;
    
    if (transportType === 'Flight') {
        // Short haul vs long haul determination
        const isLongHaul = distance > 1000;
        const emissionFactor = isLongHaul ? 
            EMISSION_FACTORS.transport.Flight.longHaul : 
            EMISSION_FACTORS.transport.Flight.shortHaul;
        
        carbonValue = distance * emissionFactor;
        culturalExchangeValue = 20; // Base value for flights
    } else {
        // Other transport types
        const emissionFactor = EMISSION_FACTORS.transport[transportType] || 0.2;
        carbonValue = distance * emissionFactor;
        
        // Cultural exchange values for different transport methods
        switch(transportType) {
            case 'Train':
                culturalExchangeValue = 40;
                break;
            case 'Bus':
                culturalExchangeValue = 50;
                break;
            case 'Car':
                culturalExchangeValue = 30;
                break;
            default:
                culturalExchangeValue = 25;
        }
    }
    
    return { carbon: carbonValue, culturalExchange: culturalExchangeValue };
};

// Helper function to calculate accommodation impact
const calculateAccommodationImpact = (accommodationType, nights = 1) => {
    const accommodationData = EMISSION_FACTORS.accommodation[accommodationType] || 
                             EMISSION_FACTORS.accommodation.hotel;
    
    return {
        carbon: accommodationData.carbon * nights,
        localEconomic: accommodationData.localEconomic,
        culturalExchange: accommodationData.culturalExchange
    };
};

// Helper function to calculate activities impact
const calculateActivitiesImpact = (activities) => {
    let totalCarbon = 0;
    let totalCulturalExchange = 0;
    let totalLocalEconomic = 0;
    
    activities.forEach(activity => {
        const activityData = EMISSION_FACTORS.activities[activity] || 
                            { carbon: 20, culturalExchange: 70, localEconomic: 60 };
        
        totalCarbon += activityData.carbon;
        totalCulturalExchange += activityData.culturalExchange;
        totalLocalEconomic += activityData.localEconomic;
    });
    
    // Average the cultural and economic impacts if there are multiple activities
    if (activities.length > 0) {
        totalCulturalExchange = totalCulturalExchange / activities.length;
        totalLocalEconomic = totalLocalEconomic / activities.length;
    }
    
    // Activities have greater impact when diverse (bonus for variety)
    if (activities.length > 2) {
        totalCulturalExchange *= 1.2; // 20% bonus for diverse activities
        totalLocalEconomic *= 1.15;   // 15% bonus for diverse activities
    }
    
    return {
        carbon: totalCarbon,
        culturalExchange: totalCulturalExchange,
        localEconomic: totalLocalEconomic
    };
};

// Calculate carbon offset options
const calculateCarbonOffsets = (carbonValue) => {
    const offsetFactors = EMISSION_FACTORS.offset;
    
    // Calculate tree planting offset
    const treesNeeded = Math.ceil(carbonValue * offsetFactors.treePerKg);
    const treeCost = Math.round(treesNeeded * offsetFactors.costPerTree);
    
    // Calculate renewable energy investment
    const kwhNeeded = Math.ceil(carbonValue * offsetFactors.renewableKwhPerKg);
    const kwhCost = Math.round(kwhNeeded * offsetFactors.costPerKwh);
    
    // Calculate local cultural preservation project support
    const localProjectUnits = Math.ceil(carbonValue * offsetFactors.localProjectPerKg);
    const localProjectCost = Math.round(localProjectUnits * offsetFactors.costPerLocalProject);
    
    return {
        trees: {
            amount: treesNeeded,
            cost: treeCost
        },
        renewableEnergy: {
            amount: kwhNeeded,
            cost: kwhCost
        },
        localProject: {
            amount: localProjectUnits,
            cost: localProjectCost
        }
    };
};

// Generate dynamic recommendations based on results
const generateRecommendations = (transportType, accommodation, activities, carbonValue, culturalExchangeValue, localEconomicValue) => {
    const recommendations = [];
    
    // Carbon reduction recommendations
    if (transportType === 'Flight') {
        recommendations.push("Consider train travel to reduce emissions by up to 70%");
        recommendations.push("If flying is necessary, consider carbon offset programs");
    } else if (transportType === 'Car') {
        recommendations.push("Consider carpooling to reduce per-person emissions");
        recommendations.push("Public transportation like trains or buses can reduce your carbon footprint");
    }
    
    // Accommodation recommendations
    if (accommodation === 'hotel') {
        recommendations.push("Homestays and eco-lodges offer more authentic cultural experiences with lower environmental impact");
    } else if (accommodation === 'apartment') {
        recommendations.push("Look for locally-owned accommodations to increase your positive economic impact");
    }
    
    // Activities recommendations
    if (!activities.includes('workshops')) {
        recommendations.push("Participate in local workshops to support artisans and gain hands-on cultural experience");
    }
    
    if (!activities.includes('food')) {
        recommendations.push("Explore local cuisine for a deeper cultural connection and to support local food economy");
    }
    
    if (activities.length < 3) {
        recommendations.push("Diversify your cultural activities for a richer travel experience");
    }
    
    // Recommendations based on impact scores
    if (culturalExchangeValue < 60) {
        recommendations.push("Seek opportunities to interact with locals through community-based tourism initiatives");
    }
    
    if (localEconomicValue < 60) {
        recommendations.push("Shop at local markets and small businesses to increase your positive economic impact");
    }
    
    // Limit to 4 most relevant recommendations
    if (recommendations.length > 4) {
        recommendations.length = 4;
    }
    
    // If no specific recommendations, provide general advice
    if (recommendations.length === 0) {
        recommendations.push(
            "Your travel plan already balances sustainability and cultural engagement well",
            "Research local customs and learn basic phrases before your trip",
            "Consider hiring local guides for deeper insights into the destination"
        );
    }
    
    return recommendations;
};

// Calculate the ecological and cultural footprint
const calculateFootprint = (transportType, distance, accommodation, activities, nights = 1) => {
    // Calculate transport impact
    const transportImpact = calculateTransportFootprint(transportType, distance);
    
    // Calculate accommodation impact
    const accommodationImpact = calculateAccommodationImpact(accommodation, nights);
    
    // Calculate activities impact
    const activitiesImpact = calculateActivitiesImpact(activities);
    
    // Total carbon footprint
    let carbonValue = transportImpact.carbon + accommodationImpact.carbon + activitiesImpact.carbon;
    
    // Cultural exchange score (weighted average)
    let culturalExchangeValue = (
        (transportImpact.culturalExchange * 0.2) + 
        (accommodationImpact.culturalExchange * 0.3) + 
        (activitiesImpact.culturalExchange * 0.5)  // Activities have highest weight
    );
    
    // Local economic impact score (weighted average)
    let localEconomicValue = (
        (accommodationImpact.localEconomic * 0.5) +  // Accommodation has highest weight
        (activitiesImpact.localEconomic * 0.5)
    );
    
    // Scale and cap values
    carbonValue = Math.min(Math.round(carbonValue), 1000);
    
    // Scale to percentages (carbon is inverse - lower is better)
    const carbonPercentage = `${Math.min(Math.round(carbonValue / 10), 100)}%`;
    const culturalExchangePercentage = `${Math.min(Math.round(culturalExchangeValue), 100)}%`;
    const localEconomicPercentage = `${Math.min(Math.round(localEconomicValue), 100)}%`;
    
    // Convert numerical values to text ratings
    const getCulturalExchangeText = (value) => {
        if (value > 85) return "Very High";
        if (value > 70) return "High";
        if (value > 50) return "Medium";
        if (value > 30) return "Low";
        return "Very Low";
    };
    
    const getLocalEconomicText = (value) => {
        if (value > 85) return "Very High";
        if (value > 70) return "High";
        if (value > 50) return "Medium";
        if (value > 30) return "Low";
        return "Very Low";
    };
    
    // Generate dynamic recommendations
    const recommendations = generateRecommendations(
        transportType, 
        accommodation, 
        activities,
        carbonValue,
        culturalExchangeValue,
        localEconomicValue
    );
    
    // Calculate carbon offset options
    const offsetOptions = calculateCarbonOffsets(carbonValue);
    
    return {
        carbon: {
            percentage: carbonPercentage,
            value: carbonValue
        },
        culturalExchange: {
            percentage: culturalExchangePercentage,
            text: getCulturalExchangeText(culturalExchangeValue)
        },
        localEconomic: {
            percentage: localEconomicPercentage,
            text: getLocalEconomicText(localEconomicValue)
        },
        recommendations: recommendations,
        offsetOptions: offsetOptions
    };
};

// Update the calculator results with calculated data
const updateCalculatorResultsFromData = (result) => {
    const resultsCard = document.querySelector('.results-card');
    
    if (resultsCard) {
        // Make the calculator results visible
        document.querySelector('.calculator-results').classList.add('active');
        
        // Update carbon footprint meter
        const carbonMeter = resultsCard.querySelector('.impact-meter:nth-child(1) .meter-fill');
        const carbonValue = resultsCard.querySelector('.impact-meter:nth-child(1) span:last-child');
        
        carbonMeter.style.width = result.carbon.percentage;
        carbonValue.textContent = `${result.carbon.value}kg CO₂`;
        
        // Update cultural exchange meter
        const culturalMeter = resultsCard.querySelector('.impact-meter:nth-child(2) .meter-fill');
        const culturalValue = resultsCard.querySelector('.impact-meter:nth-child(2) span:last-child');
        
        culturalMeter.style.width = result.culturalExchange.percentage;
        culturalValue.textContent = result.culturalExchange.text;
        
        // Update local economic support meter
        const economicMeter = resultsCard.querySelector('.impact-meter:nth-child(3) .meter-fill');
        const economicValue = resultsCard.querySelector('.impact-meter:nth-child(3) span:last-child');
        
        economicMeter.style.width = result.localEconomic.percentage;
        economicValue.textContent = result.localEconomic.text;
        
        // Update recommendations
        const recommendations = resultsCard.querySelector('.recommendations ul');
        
        if (recommendations && result.recommendations.length > 0) {
            recommendations.innerHTML = result.recommendations
                .map(recommendation => `<li>${recommendation}</li>`)
                .join('');
        }
        
        // Create or update carbon offset section
        let offsetSection = resultsCard.querySelector('.carbon-offset');
        
        if (!offsetSection) {
            // Create offset section if it doesn't exist
            offsetSection = document.createElement('div');
            offsetSection.className = 'carbon-offset';
            offsetSection.innerHTML = `
                <h4>Carbon Offset Options</h4>
                <p>Offset your ${result.carbon.value}kg CO₂ footprint through these options:</p>
                <div class="offset-options"></div>
            `;
            resultsCard.appendChild(offsetSection);
        } else {
            // Update the existing offset section content
            offsetSection.querySelector('p').textContent = `Offset your ${result.carbon.value}kg CO₂ footprint through these options:`;
        }
        
        // Create or update offset options
        const offsetOptionsContainer = offsetSection.querySelector('.offset-options');
        offsetOptionsContainer.innerHTML = '';
        
        // Tree planting option
        const treeOption = document.createElement('div');
        treeOption.className = 'offset-option';
        treeOption.innerHTML = `
            <div class="offset-icon"><i class="fas fa-tree"></i></div>
            <div class="offset-details">
                <h5>Plant Trees</h5>
                <p>Plant ${result.offsetOptions.trees.amount} trees to offset your carbon footprint.</p>
                <span class="offset-cost">Estimated cost: $${result.offsetOptions.trees.cost}</span>
                <div class="donate-links">
                    <span class="donate-label">Donate:</span>
                    <div class="donate-buttons">
                        <a href="https://onetreeplanted.org/products/plant-trees-for-earth-day" target="_blank" class="donate-btn">
                            <i class="fas fa-leaf"></i> One Tree Planted
                        </a>
                        <a href="https://teamtrees.org" target="_blank" class="donate-btn">
                            <i class="fas fa-tree"></i> Team Trees
                        </a>
                    </div>
                </div>
            </div>
        `;
        offsetOptionsContainer.appendChild(treeOption);
        
        // Renewable energy option
        const renewableOption = document.createElement('div');
        renewableOption.className = 'offset-option';
        renewableOption.innerHTML = `
            <div class="offset-icon"><i class="fas fa-solar-panel"></i></div>
            <div class="offset-details">
                <h5>Support Renewable Energy</h5>
                <p>Fund ${result.offsetOptions.renewableEnergy.amount} kWh of clean energy production.</p>
                <span class="offset-cost">Estimated cost: $${result.offsetOptions.renewableEnergy.cost}</span>
                <div class="donate-links">
                    <span class="donate-label">Donate:</span>
                    <div class="donate-buttons">
                        <a href="https://goldstandard.org/take-action/donate" target="_blank" class="donate-btn">
                            <i class="fas fa-sun"></i> Gold Standard
                        </a>
                        <a href="https://www.atmosfair.de/en/donate/" target="_blank" class="donate-btn">
                            <i class="fas fa-globe"></i> Atmosfair
                        </a>
                    </div>
                </div>
            </div>
        `;
        offsetOptionsContainer.appendChild(renewableOption);
        
        // Local cultural project option
        const localOption = document.createElement('div');
        localOption.className = 'offset-option';
        localOption.innerHTML = `
            <div class="offset-icon"><i class="fas fa-hands-helping"></i></div>
            <div class="offset-details">
                <h5>Support Cultural Preservation</h5>
                <p>Fund local cultural preservation projects in your destination.</p>
                <span class="offset-cost">Estimated cost: $${result.offsetOptions.localProject.cost}</span>
                <div class="donate-links">
                    <span class="donate-label">Donate:</span>
                    <div class="donate-buttons">
                        <a href="https://www.paypal.com/donate/?hosted_button_id=TGDETY5ERSUQU" target="_blank" class="donate-btn">
                            <i class="fas fa-landmark"></i> UNESCO
                        </a>
                    </div>
                </div>
            </div>
        `;
        offsetOptionsContainer.appendChild(localOption);
    }
};

// Initialize the calculator
const initCalculator = () => {
    const calculateButton = document.querySelector('.calculate-btn');
    const resultsSection = document.querySelector('.calculator-results');
    
    // Hide the results card initially, show only placeholder
    if (resultsSection) {
        const placeholderMessage = resultsSection.querySelector('.placeholder-message');
        const resultsCard = resultsSection.querySelector('.results-card');
        
        if (placeholderMessage && resultsCard) {
            placeholderMessage.style.display = 'block';
            resultsCard.style.display = 'none';
        }
    }
    
    if (calculateButton) {
        calculateButton.addEventListener('click', async function() {
            calculateButton.textContent = 'Calculating...';
            calculateButton.disabled = true;
            
            try {
                // Get the selected transport option
                const selectedTransport = document.querySelector('.transport-option.selected');
                const transportType = selectedTransport ? selectedTransport.querySelector('span').textContent : 'Flight';
                
                // Get the distance value
                const distance = document.getElementById('distance').value || 1000;
                
                // Get accommodation type
                const accommodation = document.getElementById('accommodation').value;
                
                // Get selected activities from the new activity options
                const selectedActivities = document.querySelectorAll('.activity-option.selected');
                const activities = Array.from(selectedActivities).map(option => option.getAttribute('data-value'));
                
                // Validate that at least one activity is selected
                if (activities.length === 0) {
                    alert('Please select at least one cultural activity.');
                    calculateButton.textContent = 'Calculate Footprint';
                    calculateButton.disabled = false;
                    return;
                }
                
                // Get number of nights (could be added as an input field in future)
                const nights = 2; // Default to 2 nights
                
                // Simulate API delay for a smoother experience
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Hide placeholder, show results card
                if (resultsSection) {
                    const placeholderMessage = resultsSection.querySelector('.placeholder-message');
                    const resultsCard = resultsSection.querySelector('.results-card');
                    
                    if (placeholderMessage && resultsCard) {
                        placeholderMessage.style.display = 'none';
                        resultsCard.style.display = 'block';
                    }
                }
                
                // Get footprint calculation directly from local function
                const result = calculateFootprint(
                    transportType,
                    distance,
                    accommodation,
                    activities,
                    nights
                );
                
                updateCalculatorResultsFromData(result);
                
                // Scroll to show the results
                document.querySelector('.calculator-results').scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (error) {
                alert('There was an error calculating your footprint. Please try again.');
                console.error('Error calculating footprint:', error);
            } finally {
                calculateButton.textContent = 'Calculate Footprint';
                calculateButton.disabled = false;
            }
        });
    }
};

// Main initialization function
const initEcoCalculator = () => {
    initTransportOptions();
    initActivityOptions();
    initCalculator();
};

export default initEcoCalculator; 