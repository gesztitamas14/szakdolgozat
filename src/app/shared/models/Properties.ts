export interface Property {
    propertyID: string;
    address: string;
    price: number;
    size: number;
    description: string;
    photos: string[];
    features: {
      type: string;
      numberOfRooms: number;
      numberOfBathrooms: number;
    };
    status: string;
    uploaderID: string;
    location: string;
    sold: boolean;
  }