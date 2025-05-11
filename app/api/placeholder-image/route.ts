// app/api/placeholder-image/route.ts
import { NextRequest } from "next/server";

// Create a simple SVG placeholder image right in the response
export async function GET(req: NextRequest) {
  try {
    // Parse URL parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "1";
    const width = parseInt(searchParams.get("width") || "512", 10);
    const height = parseInt(searchParams.get("height") || "512", 10);
    const category = searchParams.get("category") || "nature";
    const isAdvanced = searchParams.get("advanced") === "true";
    
    // Generate a color based on the category
    let bgColor = "#4287f5"; // Default blue
    switch (category) {
      case "city": bgColor = "#3a3a3a"; break; // Gray
      case "nature": bgColor = "#2e8b57"; break; // Sea Green
      case "people": bgColor = "#e91e63"; break; // Pink
      case "animals": bgColor = "#795548"; break; // Brown
      case "abstract": bgColor = "#9c27b0"; break; // Purple
      case "food": bgColor = "#ff9800"; break; // Orange
      case "technology": bgColor = "#607d8b"; break; // Blue Gray
      case "fantasy": bgColor = "#673ab7"; break; // Deep Purple
      case "space": bgColor = "#111111"; break; // Black
      case "historical": bgColor = "#a1887f"; break; // Brown
      default: bgColor = "#4287f5"; break; // Blue
    }
    
    // Generate a lighter color for advanced models
    const lightColor = isAdvanced 
      ? lightenColor(bgColor, 30)
      : bgColor;
      
    // Create a simple SVG with a nice gradient background
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${lightColor};stop-opacity:1" />
          </linearGradient>
          <filter id="noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" ${isAdvanced ? 'seed="1"' : ''} />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="${isAdvanced ? '5' : '3'}" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" ${isAdvanced ? 'filter="url(#noise)"' : ''} />
        <g ${isAdvanced ? 'filter="url(#noise)"' : ''}>
          ${generateShapes(category, width, height, id, isAdvanced)}
        </g>
        <text x="50%" y="${height - 20}" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
          ${category.toUpperCase()} ${id}
        </text>
      </svg>
    `;
    
    // Return the SVG image with appropriate headers
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error generating placeholder image:", error);
    // Fall back to a simple error SVG
    const errorSvg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#FF0000" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">Error</text>
      </svg>
    `;
    return new Response(errorSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  }
}

// Helper function to lighten a color
function lightenColor(color: string, percent: number): string {
  // Convert hex to RGB
  let hex = color.replace('#', '');
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  // Lighten
  r = Math.min(255, r + Math.floor(r * percent / 100));
  g = Math.min(255, g + Math.floor(g * percent / 100));
  b = Math.min(255, b + Math.floor(b * percent / 100));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Generate SVG shapes based on category
function generateShapes(category: string, width: number, height: number, id: string, isAdvanced: boolean): string {
  const seed = parseInt(id, 10) % 1000;
  const numShapes = isAdvanced ? 15 + (seed % 10) : 5 + (seed % 5);
  let shapes = '';
  
  // Different shapes for different categories
  switch (category) {
    case 'city':
      // Generate buildings
      for (let i = 0; i < numShapes; i++) {
        const buildingWidth = 50 + (((seed + i) * 13) % 100);
        const buildingHeight = 100 + (((seed + i) * 17) % 300);
        const x = ((seed + i * 100) % (width - buildingWidth));
        shapes += `<rect x="${x}" y="${height - buildingHeight}" width="${buildingWidth}" height="${buildingHeight}" 
                    fill="#${((seed + i * 111) % 256).toString(16).padStart(2, '0')}${((seed + i * 222) % 256).toString(16).padStart(2, '0')}${((seed + i * 333) % 256).toString(16).padStart(2, '0')}" 
                    opacity="${0.7 + (i % 3) * 0.1}" />`;
                    
        // Add windows for advanced mode
        if (isAdvanced) {
          const windowSize = 5;
          const windowSpacing = 15;
          for (let wx = x + 10; wx < x + buildingWidth - 10; wx += windowSpacing) {
            for (let wy = height - buildingHeight + 20; wy < height - 20; wy += windowSpacing) {
              if ((wx + wy + seed) % 3 === 0) { // Some randomness for window lights
                shapes += `<rect x="${wx}" y="${wy}" width="${windowSize}" height="${windowSize}" fill="yellow" opacity="0.8" />`;
              }
            }
          }
        }
      }
      break;
      
    case 'nature':
      // Generate trees and mountains
      const mountainPoints = `0,${height} ${width},${height} ${width},${height - 200 - (seed % 100)} ${width * 0.7},${height - 150 - (seed % 50)} ${width * 0.5},${height - 250 - (seed % 100)} ${width * 0.3},${height - 100 - (seed % 50)} 0,${height - 180 - (seed % 70)}`;
      shapes += `<polygon points="${mountainPoints}" fill="#507B4A" opacity="0.8" />`;
      
      // Trees
      for (let i = 0; i < numShapes; i++) {
        const x = ((seed + i * 100) % (width - 40));
        const treeHeight = 50 + (((seed + i) * 17) % 100);
        shapes += `<rect x="${x + 10}" y="${height - 40 - treeHeight}" width="20" height="${treeHeight}" fill="#8B4513" />`;
        shapes += `<circle cx="${x + 20}" cy="${height - 40 - treeHeight}" r="${30 + (i % 20)}" fill="#2E8B57" opacity="${0.7 + (i % 3) * 0.1}" />`;
      }
      break;
      
    case 'abstract':
      // Generate random geometric shapes
      for (let i = 0; i < numShapes; i++) {
        const shapeType = (seed + i) % 3;
        const x = ((seed + i * 111) % (width - 100)) + 50;
        const y = ((seed + i * 222) % (height - 100)) + 50;
        const size = 20 + ((seed + i) % 80);
        const color = `#${((seed + i * 123) % 256).toString(16).padStart(2, '0')}${((seed + i * 234) % 256).toString(16).padStart(2, '0')}${((seed + i * 345) % 256).toString(16).padStart(2, '0')}`;
        
        if (shapeType === 0) {
          // Circle
          shapes += `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${color}" opacity="${0.6 + (i % 5) * 0.1}" />`;
        } else if (shapeType === 1) {
          // Rectangle
          shapes += `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="${color}" opacity="${0.6 + (i % 5) * 0.1}" 
            transform="rotate(${(seed + i * 10) % 90}, ${x}, ${y})" />`;
        } else {
          // Triangle
          const x1 = x;
          const y1 = y - size/2;
          const x2 = x - size/2;
          const y2 = y + size/2;
          const x3 = x + size/2;
          const y3 = y + size/2;
          shapes += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${color}" opacity="${0.6 + (i % 5) * 0.1}" />`;
        }
      }
      break;
      
    case 'technology':
      // Generate circuit-like patterns
      shapes += `<rect x="10%" y="10%" width="80%" height="80%" fill="none" stroke="#00FFFF" stroke-width="2" opacity="0.6" />`;
      
      // Horizontal and vertical lines
      for (let i = 0; i < numShapes; i++) {
        const isHorizontal = (seed + i) % 2 === 0;
        const position = ((seed + i * 111) % 80) + 10; // 10% to 90%
        const positionPercentage = `${position}%`;
        
        if (isHorizontal) {
          shapes += `<line x1="10%" y1="${positionPercentage}" x2="90%" y2="${positionPercentage}" stroke="#00FFFF" stroke-width="1" opacity="0.5" />`;
        } else {
          shapes += `<line x1="${positionPercentage}" y1="10%" x2="${positionPercentage}" y2="90%" stroke="#00FFFF" stroke-width="1" opacity="0.5" />`;
        }
        
        // Add some "chips" for advanced mode
        if (isAdvanced && i % 3 === 0) {
          const chipX = isHorizontal ? ((seed + i * 222) % 70) + 15 : position;
          const chipY = isHorizontal ? position : ((seed + i * 222) % 70) + 15;
          const chipSize = 5 + (i % 5);
          
          shapes += `<rect x="${chipX - chipSize/2}%" y="${chipY - chipSize/2}%" width="${chipSize}%" height="${chipSize}%" fill="#FFAA00" opacity="0.8" />`;
        }
      }
      
      // Add some connection dots
      for (let i = 0; i < numShapes / 2; i++) {
        const dotX = ((seed + i * 111) % 80) + 10;
        const dotY = ((seed + i * 222) % 80) + 10;
        shapes += `<circle cx="${dotX}%" cy="${dotY}%" r="1%" fill="#00FFFF" opacity="0.8" />`;
      }
      break;
      
    case 'fantasy':
      // Generate magical-looking elements
      
      // Add a mystic circle
      shapes += `<circle cx="50%" cy="50%" r="${30 + (seed % 20)}%" fill="none" stroke="#9932CC" stroke-width="3" opacity="0.6" />`;
      
      // Add some magical symbols
      const symbols = isAdvanced ? numShapes : Math.min(5, numShapes);
      for (let i = 0; i < symbols; i++) {
        const angle = (i * 360 / symbols) + (seed % 30);
        const radius = 25 + (seed % 10);
        const x = width / 2 + radius * Math.cos(angle * Math.PI / 180) * width / 100;
        const y = height / 2 + radius * Math.sin(angle * Math.PI / 180) * height / 100;
        
        shapes += `<circle cx="${x}" cy="${y}" r="${5 + (i % 5)}" fill="#FFAA00" opacity="0.8" />`;
        
        if (isAdvanced) {
          // Add connecting lines for advanced mode
          shapes += `<line x1="${width/2}" y1="${height/2}" x2="${x}" y2="${y}" stroke="#FFAA00" stroke-width="2" opacity="0.4" />`;
        }
      }
      
      // Add a central magic symbol
      shapes += `<polygon points="${width/2},${height/2-40} ${width/2+34.6},${height/2+20} ${width/2-34.6},${height/2+20}" fill="none" stroke="#FFAA00" stroke-width="3" opacity="0.8" />`;
      shapes += `<circle cx="${width/2}" cy="${height/2}" r="10" fill="#FFFFFF" opacity="0.9" />`;
      break;
      
    default:
      // Generate some basic shapes for any other category
      for (let i = 0; i < numShapes; i++) {
        const x = ((seed + i * 111) % (width - 50)) + 25;
        const y = ((seed + i * 222) % (height - 50)) + 25;
        const size = 20 + ((seed + i) % 50);
        const color = `#${((seed + i * 123) % 256).toString(16).padStart(2, '0')}${((seed + i * 234) % 256).toString(16).padStart(2, '0')}${((seed + i * 345) % 256).toString(16).padStart(2, '0')}`;
        shapes += `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${color}" opacity="0.6" />`;
      }
  }
  
  return shapes;
}