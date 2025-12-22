import { Node } from "./node";
export function getNodeFromGlobalId(root: Node, globalId: string) {
    const ids = globalId.split('-').map(str => parseInt(str));

    let currentId = ids.shift();
    let parentNode = root;
    while(currentId !== undefined) {
        parentNode = parentNode.children.filter(ch => ch.id === currentId)[0];
        currentId = ids.shift();
    }
    return parentNode;
}

export function getFlattenNodes(root: Node) {
    const nodes: Node[] = [];
    const stack: Node[] = [root];
    while(stack.length > 0) {
        const node = stack.pop();
        if (node) {
            nodes.push(node);
            stack.push(...node.children);
        }
    }
    return nodes;
}