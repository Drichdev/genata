import { faker } from "@faker-js/faker";
import type { FieldType } from "@/lib/type";

export const generateMockData = (
  fields: { name: string; type: FieldType }[],
  count = 100
) => {
  const data = [];

  for (let i = 0; i < count; i++) {
    const row: Record<string, string> = {};

    fields.forEach((field) => {
      switch (field.type) {
        case "first_name":
          row[field.name] = faker.person.firstName();
          break;
        case "last_name":
          row[field.name] = faker.person.lastName();
          break;
        case "email":
          row[field.name] = faker.internet.email();
          break;
        case "password":
          row[field.name] = faker.internet.password();
          break;
        case "phone":
          row[field.name] = faker.phone.number();
          break;
        case "address":
          row[field.name] = faker.location.streetAddress();
          break;
        case "city":
          row[field.name] = faker.location.city();
          break;
        case "country":
          row[field.name] = faker.location.country();
          break;
        case "zip":
          row[field.name] = faker.location.zipCode();
          break;
        case "date":
          row[field.name] = faker.date.past().toISOString().slice(0, 10);
          break;
        case "datetime":
          row[field.name] = faker.date.recent().toISOString();
          break;
        case "int":
          row[field.name] = String(faker.number.int({ min: 0, max: 100 }));
          break;
        case "float":
          row[field.name] = String(faker.number.float({ min: 0, max: 100, fractionDigits: 2 }));
          break;
        case "uuid":
          row[field.name] = faker.string.uuid();
          break;
        case "boolean":
          row[field.name] = faker.datatype.boolean() ? "true" : "false";
          break;
        case "id_increment":
          row[field.name] = String(i + 1);
          break;
        case "number":
          row[field.name] = String(faker.number.int({ min: 0, max: 1000 }));
          break;
        case "zero_one":
          row[field.name] = String(faker.number.int({ min: 0, max: 1 }));
          break;
        default:
          row[field.name] = "";
      }
    });

    data.push(row);
  }

  return data;
};
