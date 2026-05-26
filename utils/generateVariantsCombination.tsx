/* eslint-disable @typescript-eslint/no-explicit-any */
function generateCombinations(attributes: { name: string; values: string[] }[]) {
    if (attributes.length === 0) return [];

    return attributes.reduce(
        (acc, attr) => {
            const result: any[] = [];

            acc.forEach(item => {
                attr.values.forEach(value => {
                    result.push({
                        ...item,
                        [attr.name]: value,
                    });
                });
            });

            return result;
        },
        [{}],
    );
}

export default generateCombinations;
