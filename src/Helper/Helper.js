export const isValidString = data => {
    return data !== null && data !== undefined && data !== '';
  };

  export const isValidElement = data => {
    return data !== null && data !== undefined;
  };

  export function formatDateIntoDMY(formattedDate) {
    const parts = formattedDate.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    return `${day}-${month}-${year}`;
}