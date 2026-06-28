use std::collections::HashMap;

fn main() {
    let numbers: Vec<i32> = vec![10, 20, 30, 40, 50];

    for (index, value) in numbers.iter().enumerate() {
        println!("numbers[{index}] = {value}");
    }

    println!("--- hashmap example ---");
    let mut scores: HashMap<&str, i32> = HashMap::new();
    scores.insert("alice", 95);
    scores.insert("bob", 88);
    scores.insert("carol", 91);

    for (name, score) in &scores {
        println!("{name}: {score}");
    }

    if let Some(alice_score) = scores.get("alice") {
        println!("alice -> {alice_score}");
    }
}
